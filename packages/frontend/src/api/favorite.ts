import type FavoriteController from "@rating-tracker/backend/api/favorites";
import { favoritesAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const favoriteClient = hc<typeof FavoriteController.prototype.router>(`${basePath}${favoritesAPIPath}`);

export default favoriteClient;
