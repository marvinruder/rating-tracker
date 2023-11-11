import {
  baseURL,
  favoritesEndpointPath,
  fetchMarketScreenerEndpointPath,
  fetchMorningstarEndpointPath,
  fetchMSCIEndpointPath,
  fetchRefinitivEndpointPath,
  fetchSPEndpointPath,
  fetchSustainalyticsEndpointPath,
  registerEndpointPath,
  resourcesEndpointPath,
  sessionEndpointPath,
  signInEndpointPath,
  statusEndpointPath,
  stocksEndpointPath,
  stockLogoEndpointSuffix,
  accountEndpointPath,
  watchlistsEndpointPath,
  usersEndpointPath,
  logoBackgroundEndpointPath,
} from "@rating-tracker/commons";
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import { components } from "./components";
import * as accountEndpoint from "./paths/account";
import * as registerEndpoint from "./paths/auth/register";
import * as signInEndpoint from "./paths/auth/signIn";
import * as favoritesEndpoint from "./paths/favorites";
import * as favoriteEndpoint from "./paths/favorites/favorite";
import * as marketScreenerEndpoint from "./paths/fetch/marketScreenerEndpoint";
import * as morningstarEndpoint from "./paths/fetch/morningstarEndpoint";
import * as msciEndpoint from "./paths/fetch/msciEndpoint";
import * as refinitivEndpoint from "./paths/fetch/refinitivEndpoint";
import * as spEndpoint from "./paths/fetch/spEndpoint";
import * as sustainalyticsEndpoint from "./paths/fetch/sustainalyticsEndpoint";
import * as logoBackgroundEndpoint from "./paths/logobackground";
import * as resourceEndpoint from "./paths/resources/resource";
import * as sessionEndpoint from "./paths/sessionEndpoint";
import * as statusEndpoint from "./paths/statusEndpoint";
import * as stocksEndpoint from "./paths/stocks";
import * as stockEndpoint from "./paths/stocks/stock";
import * as stockLogoEndpoint from "./paths/stocks/stock/logo";
import * as usersEndpoint from "./paths/users";
import * as userEndpoint from "./paths/users/user";
import * as watchlistsEndpoint from "./paths/watchlists";
import * as watchlistEndpoint from "./paths/watchlists/watchlist";
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
    [`${baseURL}${accountEndpointPath}`]: accountEndpoint,
    [`${baseURL}${registerEndpointPath}`]: registerEndpoint,
    [`${baseURL}${signInEndpointPath}`]: signInEndpoint,
    [`${baseURL}${logoBackgroundEndpointPath}`]: logoBackgroundEndpoint,
    [`${baseURL}${stocksEndpointPath}`]: stocksEndpoint,
    [`${baseURL}${stocksEndpointPath}/{ticker}`]: stockEndpoint,
    [`${baseURL}${stocksEndpointPath}/{ticker}${stockLogoEndpointSuffix}`]: stockLogoEndpoint,
    [`${baseURL}${fetchMorningstarEndpointPath}`]: morningstarEndpoint,
    [`${baseURL}${fetchMarketScreenerEndpointPath}`]: marketScreenerEndpoint,
    [`${baseURL}${fetchMSCIEndpointPath}`]: msciEndpoint,
    [`${baseURL}${fetchRefinitivEndpointPath}`]: refinitivEndpoint,
    [`${baseURL}${fetchSPEndpointPath}`]: spEndpoint,
    [`${baseURL}${fetchSustainalyticsEndpointPath}`]: sustainalyticsEndpoint,
    [`${baseURL}${resourcesEndpointPath}/{id}`]: resourceEndpoint,
    [`${baseURL}${statusEndpointPath}`]: statusEndpoint,
    [`${baseURL}${sessionEndpointPath}`]: sessionEndpoint,
    [`${baseURL}${usersEndpointPath}`]: usersEndpoint,
    [`${baseURL}${usersEndpointPath}/{email}`]: userEndpoint,
    [`${baseURL}${watchlistsEndpointPath}`]: watchlistsEndpoint,
    [`${baseURL}${watchlistsEndpointPath}/{id}`]: watchlistEndpoint,
    [`${baseURL}${favoritesEndpointPath}`]: favoritesEndpoint,
    [`${baseURL}${favoritesEndpointPath}/{ticker}`]: favoriteEndpoint,
  },
  tags: [],
  components: components,
};

export default openapiDocument;
