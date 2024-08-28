import type FavoriteController from "@rating-tracker/backend/api/favorites";
import { favoritesAPIPath, baseURL } from "@rating-tracker/commons";
import { hc } from "hono/client";

const favoriteClient = hc<typeof FavoriteController.prototype.router>(`${baseURL}${favoritesAPIPath}`);

export default favoriteClient;
