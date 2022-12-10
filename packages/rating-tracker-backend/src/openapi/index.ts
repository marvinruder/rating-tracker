import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { components } from "./components.js";
import * as fillWithExampleDataEndpoint from "./paths/stock/fillWithExampleDataEndpoint.js";
import * as listEndpoint from "./paths/stock/listEndpoint.js";
import * as morningstarEndpoint from "./paths/fetch/morningstarEndpoint.js";
import * as msciEndpoint from "./paths/fetch/msciEndpoint.js";
import * as registerEndpoint from "./paths/auth/registerEndpoint.js";
import * as sessionEndpoint from "./paths/sessionEndpoint.js";
import * as statusEndpoint from "./paths/statusEndpoint.js";
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
    "/api/stock/fillWithExampleData": fillWithExampleDataEndpoint,
    "/api/stock/{ticker}": stockEndpoint,
    "/api/fetch/morningstar": morningstarEndpoint,
    "/api/fetch/msci": msciEndpoint,
    "/api/status": statusEndpoint,
    "/api/session": sessionEndpoint,
  },
  tags: [],
  components: components,
};

export default openapiDocument;
