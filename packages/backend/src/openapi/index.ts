import {
  baseURL,
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
  stockLogoBackgroundEndpointPath,
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
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import { components } from "./components";
import * as registerEndpoint from "./paths/auth/registerEndpoint";
import * as signInEndpoint from "./paths/auth/signInEndpoint";
import * as favoriteEndpoint from "./paths/favorite";
import * as favoriteListEndpoint from "./paths/favorite/listEndpoint";
import * as marketScreenerEndpoint from "./paths/fetch/marketScreenerEndpoint";
import * as morningstarEndpoint from "./paths/fetch/morningstarEndpoint";
import * as msciEndpoint from "./paths/fetch/msciEndpoint";
import * as refinitivEndpoint from "./paths/fetch/refinitivEndpoint";
import * as spEndpoint from "./paths/fetch/spEndpoint";
import * as sustainalyticsEndpoint from "./paths/fetch/sustainalyticsEndpoint";
import * as resourceEndpoint from "./paths/resource";
import * as sessionEndpoint from "./paths/sessionEndpoint";
import * as statusEndpoint from "./paths/statusEndpoint";
import * as stockEndpoint from "./paths/stock";
import * as stockComputeEndpoint from "./paths/stock/computeEndpoint";
import * as stockListEndpoint from "./paths/stock/listEndpoint";
import * as stockLogoEndpoint from "./paths/stock/logo";
import * as stockLogoBackgroundEndpoint from "./paths/stock/logobackground";
import * as userEndpoint from "./paths/user";
import * as userManagementEndpoint from "./paths/userManagement";
import * as userListEndpoint from "./paths/userManagement/listEndpoint";
import * as watchlistEndpoint from "./paths/watchlist";
import * as watchlistSummaryEndpoint from "./paths/watchlist/summaryEndpoint";
import { servers } from "./servers";

/**
 * The OpenAPI document describing all API endpoints.
 */
export const openapiDocument: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "Rating Tracker Backend",
    version: "2.5.0",
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
    [`${baseURL}${registerEndpointPath}`]: registerEndpoint,
    [`${baseURL}${signInEndpointPath}`]: signInEndpoint,
    [`${baseURL}${stockListEndpointPath}`]: stockListEndpoint,
    [`${baseURL}${stockLogoBackgroundEndpointPath}`]: stockLogoBackgroundEndpoint,
    [`${baseURL}${stockComputeEndpointPath}`]: stockComputeEndpoint,
    [`${baseURL}${stockEndpointPath}/{ticker}`]: stockEndpoint,
    [`${baseURL}${stockLogoEndpointPath}/{ticker}`]: stockLogoEndpoint,
    [`${baseURL}${fetchMorningstarEndpointPath}`]: morningstarEndpoint,
    [`${baseURL}${fetchMarketScreenerEndpointPath}`]: marketScreenerEndpoint,
    [`${baseURL}${fetchMSCIEndpointPath}`]: msciEndpoint,
    [`${baseURL}${fetchRefinitivEndpointPath}`]: refinitivEndpoint,
    [`${baseURL}${fetchSPEndpointPath}`]: spEndpoint,
    [`${baseURL}${fetchSustainalyticsEndpointPath}`]: sustainalyticsEndpoint,
    [`${baseURL}${resourceEndpointPath}/{id}`]: resourceEndpoint,
    [`${baseURL}${statusEndpointPath}`]: statusEndpoint,
    [`${baseURL}${sessionEndpointPath}`]: sessionEndpoint,
    [`${baseURL}${userManagementEndpointPath}/{email}`]: userManagementEndpoint,
    [`${baseURL}${userListEndpointPath}`]: userListEndpoint,
    [`${baseURL}${userEndpointPath}`]: userEndpoint,
    [`${baseURL}${watchlistEndpointPath}/{id}`]: watchlistEndpoint,
    [`${baseURL}${watchlistSummaryEndpointPath}`]: watchlistSummaryEndpoint,
    [`${baseURL}${favoriteEndpointPath}/{ticker}`]: favoriteEndpoint,
    [`${baseURL}${favoriteListEndpointPath}`]: favoriteListEndpoint,
  },
  tags: [],
  components: components,
};

export default openapiDocument;
