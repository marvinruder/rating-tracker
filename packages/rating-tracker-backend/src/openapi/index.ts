import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { components } from "./components.js";
import * as listEndpoint from "./paths/stock/listEndpoint.js";
import * as morningstarEndpoint from "./paths/fetch/morningstarEndpoint.js";
import * as marketScreenerEndpoint from "./paths/fetch/marketScreenerEndpoint.js";
import * as msciEndpoint from "./paths/fetch/msciEndpoint.js";
import * as refinitivEndpoint from "./paths/fetch/refinitivEndpoint.js";
import * as spEndpoint from "./paths/fetch/spEndpoint.js";
import * as sustainalyticsEndpoint from "./paths/fetch/sustainalyticsEndpoint.js";
import * as registerEndpoint from "./paths/auth/registerEndpoint.js";
import * as sessionEndpoint from "./paths/sessionEndpoint.js";
import * as statusEndpoint from "./paths/statusEndpoint.js";
import * as logoEndpoint from "./paths/stock/logo/index.js";
import * as stockEndpoint from "./paths/stock/index.js";
import * as signInEndpoint from "./paths/auth/signInEndpoint.js";
import { servers } from "./servers.js";

export const openapiDocument: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "Rating Tracker Backend",
    version: "0.1.0",
    contact: {
      name: "Marvin A. Ruder",
      email: "info@mruder.dev",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
    description: "Specification JSONs: [v3](/api-spec/v3).",
  },
  servers: servers,
  paths: {
    "/api/auth/register": registerEndpoint,
    "/api/auth/signIn": signInEndpoint,
    "/api/stock/list": listEndpoint,
    "/api/stock/{ticker}": stockEndpoint,
    "/api/stock/logo/{ticker}": logoEndpoint,
    "/api/fetch/morningstar": morningstarEndpoint,
    "/api/fetch/marketscreener": marketScreenerEndpoint,
    "/api/fetch/msci": msciEndpoint,
    "/api/fetch/refinitiv": refinitivEndpoint,
    "/api/fetch/sp": spEndpoint,
    "/api/fetch/sustainalytics": sustainalyticsEndpoint,
    "/api/status": statusEndpoint,
    "/api/session": sessionEndpoint,
  },
  tags: [],
  components: components,
};

export default openapiDocument;
