const { randomUUID } = await import("node:crypto");
import cookieParser from "cookie-parser";
import * as cron from "cron";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import Router from "./routers/Router.js";
import SwaggerUI from "swagger-ui-express";
import openapiDocument from "./openapi/index.js";
import * as OpenApiValidator from "express-openapi-validator";
import chalk from "chalk";
import responseTime from "response-time";
import { STATUS_CODES } from "http";
import axios from "axios";
import APIError from "./lib/apiError.js";
import { refreshSessionAndFetchUser } from "./redis/repositories/session/sessionRepository.js";
import { sessionTTLInSeconds } from "./redis/repositories/session/sessionRepositoryBase.js";
import path from "path";
import logger, { PREFIX_NODEJS } from "./lib/logger.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: ".env.local",
});

const bypassAuthenticationForInternalRequestsToken = randomUUID();

class Server {
  public app = express();
  public router = Router;
}

export const server = new Server();

server.app.disable("x-powered-by");

const staticContentPath = path.join(__dirname, "..", "..", "public");

/* istanbul ignore next */
if (
  !process.env.AUTO_FETCH_SCHEDULE ||
  process.env.NODE_ENV === "development"
) {
  server.app.use(
    "/assets/images/favicon",
    express.static(
      path.join(staticContentPath, "assets", "images", "favicon-dev"),
      {
        dotfiles: "ignore",
        lastModified: false,
        maxAge: "1 year",
      }
    )
  );
}

/* istanbul ignore next */
server.app.use(
  express.static(staticContentPath, {
    dotfiles: "ignore",
    lastModified: false,
    maxAge: "1 year",
    setHeaders: (res, filepath) => {
      !filepath.startsWith(path.join(staticContentPath, "assets")) &&
        res.setHeader("Cache-Control", "public, max-age=0");
    },
  })
);
logger.info(PREFIX_NODEJS + `Serving static content from ${staticContentPath}`);
logger.info("");

server.app.use((_, res, next) => {
  res.set("Cache-Control", "no-cache");
  next();
});

/* istanbul ignore next */
const highlightMethod = (method: string) => {
  switch (method) {
    case "GET":
      return chalk.whiteBright.bgBlue(` ${method} `) + chalk.blue.bgGrey("???");

    case "HEAD":
      return (
        chalk.whiteBright.bgMagenta(` ${method} `) + chalk.magenta.bgGrey("???")
      );

    case "POST":
      return chalk.whiteBright.bgGreen(` ${method} `) + chalk.green.bgGrey("???");

    case "PUT":
      return chalk.black.bgYellow(` ${method} `) + chalk.yellow.bgGrey("???");

    case "PATCH":
      return (
        chalk.black.bgCyanBright(` ${method} `) + chalk.cyanBright.bgGrey("???")
      );

    case "DELETE":
      return chalk.whiteBright.bgRed(` ${method} `) + chalk.red.bgGrey("???");

    default:
      return method;
  }
};

/* istanbul ignore next */
const statusCodeDescription = (statusCode: number) => {
  const statusCodeString = ` ${statusCode} ??? ${STATUS_CODES[statusCode]} `;
  switch (Math.floor(statusCode / 100)) {
    case 2:
      return chalk.whiteBright.bgGreen(statusCodeString) + chalk.green("???");

    case 1:
    case 3:
      return chalk.black.bgYellow(statusCodeString) + chalk.yellow("???");

    case 4:
    case 5:
      return chalk.whiteBright.bgRed(statusCodeString) + chalk.red("???");
  }
  return statusCodeString;
};

server.app.use(cookieParser());
server.app.use(express.json());

server.app.use(async (req, res, next) => {
  if (req.cookies.authToken) {
    try {
      res.locals.user = await refreshSessionAndFetchUser(req.cookies.authToken);
      res.cookie("authToken", req.cookies.authToken, {
        maxAge: 1000 * sessionTTLInSeconds,
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: true,
      });
    } catch (e) {
      res.clearCookie("authToken");
    }
  }
  next();
});

server.app.use("/api-docs", SwaggerUI.serve, SwaggerUI.setup(openapiDocument));
server.app.get("/api-spec/v3", (_, res) => res.json(openapiDocument));

server.app.use(
  responseTime((req: Request, res: Response, time) => {
    if (!req.originalUrl.startsWith("/api/stock/logo")) {
      chalk
        .white(
          chalk.whiteBright.bgGreen(" \uf898 ") +
            chalk.bgGrey.green("???") +
            chalk.bgGrey(
              chalk.cyanBright(" \uf5ef " + new Date().toISOString()) +
                " ??? " +
                chalk.yellow(
                  res.locals.user
                    ? `\uf007 ${res.locals.user.name} (${res.locals.user.email})`
                    : /* istanbul ignore next */
                    req.cookies.bypassAuthenticationForInternalRequestsToken ===
                      bypassAuthenticationForInternalRequestsToken
                    ? "\ufba7 cron"
                    : "\uf21b"
                ) +
                " ??? " +
                // use reverse proxy that sets this header to prevent CWE-134
                chalk.magentaBright("\uf98c" + req.headers["x-real-ip"]) +
                " "
            ) +
            chalk.grey("???") +
            "\n ??????" +
            highlightMethod(req.method) +
            chalk.bgGrey(
              ` ${req.originalUrl
                .slice(
                  1,
                  req.originalUrl.indexOf("?") == -1
                    ? undefined
                    : req.originalUrl.indexOf("?")
                )
                .replaceAll("/", " ??? ")} `
            ) +
            chalk.grey("???") +
            Object.entries(req.cookies)
              .map(
                ([key, value]) =>
                  "\n ??????" +
                  chalk.bgGrey(chalk.yellow(" \uf697") + ` ??? ${key} `) +
                  chalk.grey("???") +
                  " " +
                  value
              )
              .join(" ") +
            Object.entries(req.query)
              .map(
                ([key, value]) =>
                  "\n ??????" +
                  chalk.bgGrey(chalk.cyan(" \uf002") + ` ??? ${key} `) +
                  chalk.grey("???") +
                  " " +
                  value
              )
              .join(" ") +
            "\n ??????" +
            statusCodeDescription(res.statusCode) +
            ` after ${Math.round(time)} ms`
        )
        .split("\n")
        .forEach((line) => logger.info(line));
      logger.info("");
    }
  })
);

server.app.use(
  OpenApiValidator.middleware({
    apiSpec: openapiDocument,
    validateRequests: true,
    validateResponses: true,
  })
);

server.app.use(
  "/api",
  server.router.public,
  (req, res, next) => {
    if (
      (res.locals.user && res.locals.user.accessRights > 0) ||
      req.cookies.bypassAuthenticationForInternalRequestsToken ===
        bypassAuthenticationForInternalRequestsToken
    ) {
      next();
    } else {
      throw new APIError(
        401,
        "This endpoint is available to authenticated clients only. Please sign in."
      );
    }
  },
  server.router.private
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
server.app.use((err, _, res, next) => {
  logger.error(PREFIX_NODEJS + chalk.redBright(err));
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

/* istanbul ignore next */
if (process.env.AUTO_FETCH_SCHEDULE) {
  new cron.CronJob(
    process.env.AUTO_FETCH_SCHEDULE,
    async () => {
      await axios.get(`http://localhost:${process.env.PORT}/api/fetch/msci`, {
        params: { detach: "true" },
        headers: {
          Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
        },
      });
      await axios.get(
        `http://localhost:${process.env.PORT}/api/fetch/refinitiv`,
        {
          params: { detach: "true" },
          headers: {
            Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
          },
        }
      );
      await axios.get(`http://localhost:${process.env.PORT}/api/fetch/sp`, {
        params: { detach: "true" },
        headers: {
          Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
        },
      });
      await axios.get(
        `http://localhost:${process.env.PORT}/api/fetch/sustainalytics`,
        {
          params: { detach: "true" },
          headers: {
            Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
          },
        }
      );
      await axios.get(
        `http://localhost:${process.env.PORT}/api/fetch/marketscreener`,
        {
          params: { detach: "false" },
          headers: {
            Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
          },
        }
      );
      await axios.get(
        `http://localhost:${process.env.PORT}/api/fetch/morningstar`,
        {
          params: { detach: "true" },
          headers: {
            Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
          },
        }
      );
    },
    null,
    true
  );
  logger.info(
    chalk.whiteBright.bgGreen(" \uf898 ") +
      chalk.green.bgGrey("???") +
      chalk.whiteBright.bgGrey(` Auto Fetch activated `) +
      chalk.grey("???") +
      chalk.green(
        " This instance will periodically fetch information from data providers for all known stocks."
      )
  );
  logger.info("");
}

export const listener = server.app.listen(process.env.PORT, () => {
  logger.info(
    chalk.whiteBright.bgGreen(" \uf898 ") +
      chalk.green.bgGrey("???") +
      chalk.whiteBright.bgGrey(` \uf6ff ${process.env.PORT} `) +
      chalk.grey("???") +
      " Listening???"
  );
  logger.info("");
});
