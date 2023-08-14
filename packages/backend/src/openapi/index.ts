import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import { components } from "./components";
import * as stockListEndpoint from "./paths/stock/listEndpoint";
import * as userListEndpoint from "./paths/userManagement/listEndpoint";
import * as morningstarEndpoint from "./paths/fetch/morningstarEndpoint";
import * as marketScreenerEndpoint from "./paths/fetch/marketScreenerEndpoint";
import * as msciEndpoint from "./paths/fetch/msciEndpoint";
import * as refinitivEndpoint from "./paths/fetch/refinitivEndpoint";
import * as spEndpoint from "./paths/fetch/spEndpoint";
import * as sustainalyticsEndpoint from "./paths/fetch/sustainalyticsEndpoint";
import * as registerEndpoint from "./paths/auth/registerEndpoint";
import * as sessionEndpoint from "./paths/sessionEndpoint";
import * as statusEndpoint from "./paths/statusEndpoint";
import * as stockLogoEndpoint from "./paths/stock/logo/index";
import * as stockEndpoint from "./paths/stock/index";
import * as stockComputeEndpoint from "./paths/stock/computeEndpoint";
import * as signInEndpoint from "./paths/auth/signInEndpoint";
import * as resourceEndpoint from "./paths/resource/index";
import * as userManagementEndpoint from "./paths/userManagement/index";
import * as userEndpoint from "./paths/user/index";
import * as watchlistEndpoint from "./paths/watchlist/index";
import * as watchlistSummaryEndpoint from "./paths/watchlist/summaryEndpoint";
import * as favoriteEndpoint from "./paths/favorite/index";
import * as favoriteListEndpoint from "./paths/favorite/listEndpoint";
import { servers } from "./servers";
import {
  favoriteEndpointPath,
  favoriteListEndpointPath,
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
  watchlistEndpointPath,
  watchlistSummaryEndpointPath,
} from "@rating-tracker/commons";

/**
 * The OpenAPI document describing all API endpoints.
 */
export const openapiDocument: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "Rating Tracker Backend",
    version: "2.2.0",
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
    [`/api${watchlistEndpointPath}/{id}`]: watchlistEndpoint,
    [`/api${watchlistSummaryEndpointPath}`]: watchlistSummaryEndpoint,
    [`/api${favoriteEndpointPath}/{ticker}`]: favoriteEndpoint,
    [`/api${favoriteListEndpointPath}`]: favoriteListEndpoint,
  },
  tags: [],
  components: components,
};

export default openapiDocument;
