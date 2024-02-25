import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import * as watchlist from "../../../parameters/watchlist";
import { badRequest, forbidden, notFound, unauthorized } from "../../../responses/clientError";
import { noContent, okWatchlist } from "../../../responses/success";

/**
 * Get the specified watchlist
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Watchlists API"],
  operationId: "getWatchlist",
  summary: "Read Watchlist API endpoint",
  description: "Get the specified watchlist",
  parameters: [
    {
      ...watchlist.id,
      in: "path",
      required: true,
    },
  ],
  responses: {
    "200": okWatchlist,
    "401": unauthorized,
    "403": forbidden,
    "404": notFound,
  },
};

/**
 * Update the watchlist using the information provided.
 */
const patch: OpenAPIV3.OperationObject = {
  tags: ["Watchlists API"],
  operationId: "patchWatchlist",
  summary: "Update Watchlist API endpoint",
  description: "Update the watchlist using the information provided.",
  parameters: [
    {
      ...watchlist.id,
      in: "path",
      required: true,
    },
    watchlist.name,
    watchlist.subscribed,
  ],
  responses: {
    "204": noContent,
    "400": badRequest,
    "401": unauthorized,
    "403": forbidden,
    "404": notFound,
  },
};

/**
 * Delete the specified watchlist
 */
const deleteRequest: OpenAPIV3.OperationObject = {
  tags: ["Watchlists API"],
  operationId: "deleteWatchlist",
  summary: "Delete Watchlist API endpoint",
  description: "Delete the specified watchlist",
  parameters: [
    {
      ...watchlist.id,
      in: "path",
      required: true,
    },
  ],
  responses: {
    "204": noContent,
    "401": unauthorized,
    "403": forbidden,
    "404": notFound,
  },
};

export { get, deleteRequest as delete, patch };
