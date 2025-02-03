import type { FavoriteAPI } from "@rating-tracker/backend/api/favorites";
import { favoritesAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const favoriteClient = hc<FavoriteAPI>(`${basePath}${favoritesAPIPath}`);

export default favoriteClient;
