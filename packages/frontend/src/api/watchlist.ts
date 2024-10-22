import type WatchlistController from "@rating-tracker/backend/api/watchlists";
import { watchlistsAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const watchlistClient = hc<typeof WatchlistController.prototype.router>(`${basePath}${watchlistsAPIPath}`);

export default watchlistClient;
