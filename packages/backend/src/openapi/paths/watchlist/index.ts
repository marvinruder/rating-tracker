import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import { badRequest, conflict, forbidden, notFound, unauthorized } from "../../responses/clientError";
import { createdWatchlistID, noContent, okWatchlist } from "../../responses/success";
import * as watchlist from "../../parameters/watchlist";

/**
 * Get the specified watchlist
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Watchlist API"],
  operationId: "getWatchlist",
  summary: "Read Watchlist API",
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
 * Create the watchlist using the information provided.
 */
const put: OpenAPIV3.OperationObject = {
  tags: ["Watchlist API"],
  operationId: "createWatchlist",
  summary: "Create Watchlist API",
  description: "Create the watchlist using the information provided.",
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: {
        pattern: "^new$",
      },
    },
    {
      ...watchlist.name,
      required: true,
    },
  ],
  responses: {
    "201": createdWatchlistID,
    "400": badRequest,
    "401": unauthorized,
    "403": forbidden,
    "409": conflict,
  },
};

/**
 * Update the watchlist using the information provided.
 */
const patch: OpenAPIV3.OperationObject = {
  tags: ["Watchlist API"],
  operationId: "updateWatchlist",
  summary: "Update Watchlist API",
  description: "Update the watchlist using the information provided.",
  parameters: [
    {
      ...watchlist.id,
      in: "path",
      required: true,
    },
    watchlist.name,
    watchlist.subscribed,
    watchlist.stocksToAdd,
    watchlist.stocksToRemove,
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
  tags: ["Watchlist API"],
  operationId: "deleteWatchlist",
  summary: "Delete Watchlist API",
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

export { get, deleteRequest as delete, put, patch };
