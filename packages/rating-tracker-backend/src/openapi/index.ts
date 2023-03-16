import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { components } from "./components.js";
import * as stockListEndpoint from "./paths/stock/listEndpoint.js";
import * as userListEndpoint from "./paths/userManagement/listEndpoint.js";
import * as morningstarEndpoint from "./paths/fetch/morningstarEndpoint.js";
import * as marketScreenerEndpoint from "./paths/fetch/marketScreenerEndpoint.js";
import * as msciEndpoint from "./paths/fetch/msciEndpoint.js";
import * as refinitivEndpoint from "./paths/fetch/refinitivEndpoint.js";
import * as spEndpoint from "./paths/fetch/spEndpoint.js";
import * as sustainalyticsEndpoint from "./paths/fetch/sustainalyticsEndpoint.js";
import * as registerEndpoint from "./paths/auth/registerEndpoint.js";
import * as sessionEndpoint from "./paths/sessionEndpoint.js";
import * as statusEndpoint from "./paths/statusEndpoint.js";
import * as stockLogoEndpoint from "./paths/stock/logo/index.js";
import * as stockEndpoint from "./paths/stock/index.js";
import * as stockComputeEndpoint from "./paths/stock/computeEndpoint.js";
import * as signInEndpoint from "./paths/auth/signInEndpoint.js";
import * as resourceEndpoint from "./paths/resource/index.js";
import * as userManagementEndpoint from "./paths/userManagement/index.js";
import * as userEndpoint from "./paths/user/index.js";
import { servers } from "./servers.js";
import {
  fetchMarketScreenerEndpointPath,
  fetchMorningstarEndpointPath,
  fetchMSCIEndpointPath,
  fetchRefinitivEndpointPath,
  fetchSPEndpointPath,
  fetchSustainalyticsEndpointPath,
  registerEndpointPath,
  resourceEndpointPath,
  sessionEndpointPath,
  signInEndpointPath,
  statusEndpointPath,
  stockComputeEndpointPath,
  stockEndpointPath,
  stockListEndpointPath,
  stockLogoEndpointPath,
  userEndpointPath,
  userListEndpointPath,
  userManagementEndpointPath,
} from "rating-tracker-commons";

/**
 * The OpenAPI document describing all API endpoints.
 */
export const openapiDocument: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "Rating Tracker Backend",
    version: "0.1.0",
    contact: {
      name: "Marvin A. Ruder",
      email: "ratingtracker@mruder.dev",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
    description: "Specification JSONs: [v3](/api-spec/v3).",
  },
  servers: servers,
  paths: {
    [`/api${registerEndpointPath}`]: registerEndpoint,
    [`/api${signInEndpointPath}`]: signInEndpoint,
    [`/api${stockListEndpointPath}`]: stockListEndpoint,
    [`/api${stockComputeEndpointPath}`]: stockComputeEndpoint,
    [`/api${stockEndpointPath}/{ticker}`]: stockEndpoint,
    [`/api${stockLogoEndpointPath}/{ticker}`]: stockLogoEndpoint,
    [`/api${fetchMorningstarEndpointPath}`]: morningstarEndpoint,
    [`/api${fetchMarketScreenerEndpointPath}`]: marketScreenerEndpoint,
    [`/api${fetchMSCIEndpointPath}`]: msciEndpoint,
    [`/api${fetchRefinitivEndpointPath}`]: refinitivEndpoint,
    [`/api${fetchSPEndpointPath}`]: spEndpoint,
    [`/api${fetchSustainalyticsEndpointPath}`]: sustainalyticsEndpoint,
    [`/api${resourceEndpointPath}/{id}`]: resourceEndpoint,
    [`/api${statusEndpointPath}`]: statusEndpoint,
    [`/api${sessionEndpointPath}`]: sessionEndpoint,
    [`/api${userManagementEndpointPath}/{email}`]: userManagementEndpoint,
    [`/api${userListEndpointPath}`]: userListEndpoint,
    [`/api${userEndpointPath}`]: userEndpoint,
  },
  tags: [],
  components: components,
};

export default openapiDocument;
