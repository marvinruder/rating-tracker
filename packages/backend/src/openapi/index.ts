import {
  baseURL,
  favoritesEndpointPath,
  fetchLSEGEndpointPath,
  fetchMarketScreenerEndpointPath,
  fetchMorningstarEndpointPath,
  fetchMSCIEndpointPath,
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
  portfoliosEndpointPath,
  accountAvatarEndpointSuffix,
  usersAvatarEndpointSuffix,
} from "@rating-tracker/commons";
import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import packageInfo from "../../package.json" with { type: "json" };

import { components } from "./components";
import * as accountEndpoint from "./paths/account";
import * as accountAvatarEndpoint from "./paths/account/avatar";
import * as registerEndpoint from "./paths/auth/register";
import * as signInEndpoint from "./paths/auth/signIn";
import * as favoritesEndpoint from "./paths/favorites";
import * as favoriteEndpoint from "./paths/favorites/favorite";
import * as lsegEndpoint from "./paths/fetch/lsegEndpoint";
import * as marketScreenerEndpoint from "./paths/fetch/marketScreenerEndpoint";
import * as morningstarEndpoint from "./paths/fetch/morningstarEndpoint";
import * as msciEndpoint from "./paths/fetch/msciEndpoint";
import * as spEndpoint from "./paths/fetch/spEndpoint";
import * as sustainalyticsEndpoint from "./paths/fetch/sustainalyticsEndpoint";
import * as logoBackgroundEndpoint from "./paths/logobackground";
import * as portfoliosEndpoint from "./paths/portfolios";
import * as portfolioEndpoint from "./paths/portfolios/portfolio";
import * as portfolioStocksEndpoint from "./paths/portfolios/portfolio/stock";
import * as resourceEndpoint from "./paths/resources/resource";
import * as sessionEndpoint from "./paths/sessionEndpoint";
import * as statusEndpoint from "./paths/statusEndpoint";
import * as stocksEndpoint from "./paths/stocks";
import * as stockEndpoint from "./paths/stocks/stock";
import * as stockLogoEndpoint from "./paths/stocks/stock/logo";
import * as usersEndpoint from "./paths/users";
import * as userEndpoint from "./paths/users/user";
import * as userAvatarEndpoint from "./paths/users/user/avatar";
import * as watchlistsEndpoint from "./paths/watchlists";
import * as watchlistEndpoint from "./paths/watchlists/watchlist";
import * as watchlistStocksEndpoint from "./paths/watchlists/watchlist/stock";
import { servers } from "./servers";

/**
 * The OpenAPI document describing all API endpoints.
 */
export const openapiDocument: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: packageInfo.title,
    version: packageInfo.version,
    contact: packageInfo.author,
    license: {
      name: packageInfo.license,
      url: "https://opensource.org/licenses/MIT",
    },
    description: "Specification JSONs: [v3](/api-spec/v3).",
  },
  servers: servers,
  paths: {
    [`${baseURL}${accountEndpointPath}`]: accountEndpoint,
    [`${baseURL}${accountEndpointPath}${accountAvatarEndpointSuffix}`]: accountAvatarEndpoint,
    [`${baseURL}${registerEndpointPath}`]: registerEndpoint,
    [`${baseURL}${signInEndpointPath}`]: signInEndpoint,
    [`${baseURL}${logoBackgroundEndpointPath}`]: logoBackgroundEndpoint,
    [`${baseURL}${stocksEndpointPath}`]: stocksEndpoint,
    [`${baseURL}${stocksEndpointPath}/{ticker}`]: stockEndpoint,
    [`${baseURL}${stocksEndpointPath}/{ticker}${stockLogoEndpointSuffix}`]: stockLogoEndpoint,
    [`${baseURL}${fetchMorningstarEndpointPath}`]: morningstarEndpoint,
    [`${baseURL}${fetchMarketScreenerEndpointPath}`]: marketScreenerEndpoint,
    [`${baseURL}${fetchMSCIEndpointPath}`]: msciEndpoint,
    [`${baseURL}${fetchLSEGEndpointPath}`]: lsegEndpoint,
    [`${baseURL}${fetchSPEndpointPath}`]: spEndpoint,
    [`${baseURL}${fetchSustainalyticsEndpointPath}`]: sustainalyticsEndpoint,
    [`${baseURL}${resourcesEndpointPath}/{id}`]: resourceEndpoint,
    [`${baseURL}${statusEndpointPath}`]: statusEndpoint,
    [`${baseURL}${sessionEndpointPath}`]: sessionEndpoint,
    [`${baseURL}${usersEndpointPath}`]: usersEndpoint,
    [`${baseURL}${usersEndpointPath}/{email}`]: userEndpoint,
    [`${baseURL}${usersEndpointPath}/{email}${usersAvatarEndpointSuffix}`]: userAvatarEndpoint,
    [`${baseURL}${watchlistsEndpointPath}`]: watchlistsEndpoint,
    [`${baseURL}${watchlistsEndpointPath}/{id}`]: watchlistEndpoint,
    [`${baseURL}${watchlistsEndpointPath}/{id}${stocksEndpointPath}/{ticker}`]: watchlistStocksEndpoint,
    [`${baseURL}${favoritesEndpointPath}`]: favoritesEndpoint,
    [`${baseURL}${favoritesEndpointPath}/{ticker}`]: favoriteEndpoint,
    [`${baseURL}${portfoliosEndpointPath}`]: portfoliosEndpoint,
    [`${baseURL}${portfoliosEndpointPath}/{id}`]: portfolioEndpoint,
    [`${baseURL}${portfoliosEndpointPath}/{id}${stocksEndpointPath}/{ticker}`]: portfolioStocksEndpoint,
  },
  tags: [],
  components: components,
};
