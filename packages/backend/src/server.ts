// eslint-disable-next-line import/order
import "./utils/startup";

import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import {
  accountAPIPath,
  authAPIPath,
  basePath,
  emailAPIPath,
  favoritesAPIPath,
  fetchAPIPath,
  logoBackgroundAPIPath,
  portfoliosAPIPath,
  proxyAPIPath,
  resourcesAPIPath,
  sessionAPIPath,
  statusAPIPath,
  stocksAPIPath,
  usersAPIPath,
  watchlistsAPIPath,
} from "@rating-tracker/commons";
import { getRuntimeKey } from "hono/adapter";
import { etag } from "hono/etag";
import { secureHeaders } from "hono/secure-headers";

import packageInfo from "../package.json" with { type: "json" };

import AccountController from "./account/account.controller";
import AccountService from "./account/account.service";
import AuthController from "./auth/auth.controller";
import OIDCService from "./auth/oidc.service";
import WebAuthnService from "./auth/webauthn.service";
import DBService from "./db/db.service";
import EmailController from "./email/email.controller";
import EmailService from "./email/email.service";
import FavoriteController from "./favorite/favorite.controller";
import FavoriteService from "./favorite/favorite.service";
import FetchController from "./fetch/fetch.controller";
import FetchService from "./fetch/fetch.service";
import PortfolioController from "./portfolio/portfolio.controller";
import PortfolioService from "./portfolio/portfolio.service";
import ProxyController from "./proxy/proxy.controller";
import ProxyService from "./proxy/proxy.service";
import ResourceController from "./resource/resource.controller";
import ResourceService from "./resource/resource.service";
import SessionController from "./session/session.controller";
import SessionService from "./session/session.service";
import SignalService from "./signal/signal.service";
import StatusController from "./status/status.controller";
import StatusService from "./status/status.service";
import LogoBackgroundController from "./stock/logobackground.controller";
import StockController from "./stock/stock.controller";
import StockService from "./stock/stock.service";
import UserController from "./user/user.controller";
import UserService from "./user/user.service";
import CronScheduler from "./utils/CronScheduler";
import NotFoundError from "./utils/error/api/NotFoundError";
import ErrorHelper from "./utils/error/errorHelper";
import Logger from "./utils/logger";
import { ipExtractor, sessionValidator, staticFileHandler } from "./utils/middlewares";
import WatchlistController from "./watchlist/watchlist.controller";
import WatchlistService from "./watchlist/watchlist.service";

// Initialize services
const dbService: DBService = new DBService();
await dbService.migrate();

const emailService: EmailService = new EmailService();
const proxyService: ProxyService = new ProxyService();
const portfolioService: PortfolioService = new PortfolioService(dbService);
const resourceService: ResourceService = new ResourceService(dbService);
const sessionService: SessionService = new SessionService(dbService);
const signalService: SignalService = new SignalService();
const watchlistService: WatchlistService = new WatchlistService(dbService);
const userService: UserService = new UserService(dbService, signalService);
const accountService: AccountService = new AccountService(userService);
const favoriteService: FavoriteService = new FavoriteService(dbService, watchlistService);
const oidcService: OIDCService = new OIDCService(sessionService, userService);
const webauthnService: WebAuthnService = new WebAuthnService(dbService, sessionService, userService);
const statusService: StatusService = new StatusService(dbService, emailService, oidcService, signalService);
const stockService: StockService = new StockService(
  dbService,
  portfolioService,
  resourceService,
  signalService,
  userService,
  watchlistService,
);
const fetchService: FetchService = new FetchService(resourceService, signalService, stockService, userService);

/**
 * A server, powered by Hono. Responsible for serving static content and routing requests through various middlewares
 * and to routers.
 */
export const app = new OpenAPIHono();

// Log all API requests
app.use(`${basePath}/*`, Logger.logRequest);

// Add ETag support. Use weak ETags because Reverse Proxys may change the ETag when compressing the response
app.use(etag({ weak: true }));

// Do not cache responses by default. This can be overridden individually by endpoints or for static assets.
app.use(async (c, next) => {
  c.header("Cache-Control", "no-cache");
  await next();
});

// Add security-related headers
app.use("/api-docs", async (c, next) => {
  await next();
  // Override CSP, COEP, CORP for the Swagger UI
  const csp = c.res.headers.get("Content-Security-Policy");
  if (csp)
    c.header(
      "Content-Security-Policy",
      csp
        .replace("img-src ", "img-src blob: ")
        .replace("script-src ", "script-src https://cdn.jsdelivr.net/npm/swagger-ui-dist/ 'unsafe-inline' ")
        .replace("style-src ", "style-src https://cdn.jsdelivr.net/npm/swagger-ui-dist/ ")
        .replace("style-src-elem ", "style-src-elem https://cdn.jsdelivr.net/npm/swagger-ui-dist/ "),
    );
  c.header("Cross-Origin-Embedder-Policy", "unsafe-none");
  c.header("Cross-Origin-Resource-Policy", "cross-origin");
});
app.use("/assets/images/*", async (c, next) => {
  await next();
  // Override CORP for image resources
  c.header("Cross-Origin-Resource-Policy", "cross-origin");
});
app.use(
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'wasm-unsafe-eval'"],
      workerSrc: ["'self'", "blob:"],
      imgSrc: ["'self'", "data:"],
      styleSrcElem: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"],
    },
    crossOriginEmbedderPolicy: "require-corp",
    xDnsPrefetchControl: false,
    xDownloadOptions: false,
    xFrameOptions: false,
    xPermittedCrossDomainPolicies: false,
    xXssProtection: false,
  }),
);

// Extract the IP address from the request and set it as a context variable
app.use(ipExtractor);

// Serve the static files of the SPA and sets the correct cache control headers.
app.use(...staticFileHandler);

// Check for user authentication via session cookie
app.use(sessionValidator(sessionService));

// Host the OpenAPI UI
app.get("/api-docs", swaggerUI({ url: "/api-spec/v3.1" }));

// Host the OpenAPI JSON configuration
app.doc31("/api-spec/v3.1", {
  openapi: "3.1.0",
  info: {
    title: packageInfo.title,
    version: packageInfo.version,
    contact: packageInfo.author,
    license: { name: packageInfo.license, url: `https://opensource.org/licenses/${packageInfo.license}` },
    description: "Specification JSONs: [v3.1](/api-spec/v3.1).",
  },
  servers: [{ url: `https://${process.env.FQDN}` }],
});

// Initialize controllers and attach API routers
app.route(
  basePath,
  new OpenAPIHono()
    .route(accountAPIPath, new AccountController(accountService).router)
    .route(authAPIPath, new AuthController(oidcService, webauthnService).router)
    .route(emailAPIPath, new EmailController(emailService, userService).router)
    .route(favoritesAPIPath, new FavoriteController(favoriteService).router)
    .route(fetchAPIPath, new FetchController(fetchService).router)
    .route(logoBackgroundAPIPath, new LogoBackgroundController(stockService).router)
    .route(portfoliosAPIPath, new PortfolioController(portfolioService).router)
    .route(proxyAPIPath, new ProxyController(proxyService).router)
    .route(resourcesAPIPath, new ResourceController(resourceService).router)
    .route(sessionAPIPath, new SessionController(oidcService, sessionService).router)
    .route(statusAPIPath, new StatusController(statusService).router)
    .route(stocksAPIPath, new StockController(stockService).router)
    .route(usersAPIPath, new UserController(userService).router)
    .route(watchlistsAPIPath, new WatchlistController(watchlistService).router),
);

app.notFound((c) => {
  throw new NotFoundError(`Endpoint ${c.req.path} not found.`);
});

app.onError(ErrorHelper.errorHandler);

// Setup Cron Jobs
new CronScheduler(fetchService, resourceService, sessionService, signalService, userService);

export const server = serve({ fetch: app.fetch, port: process.env.PORT }, (info) => {
  Logger.info({ conponent: getRuntimeKey(), interface: info.address, port: info.port }, "Listening");
  process.env.EXIT_AFTER_READY && process.exit(0);
});
