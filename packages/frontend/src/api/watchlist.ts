import type WatchlistController from "@rating-tracker/backend/api/watchlists";
import { watchlistsAPIPath, baseURL } from "@rating-tracker/commons";
import { hc } from "hono/client";

const watchlistClient = hc<typeof WatchlistController.prototype.router>(`${baseURL}${watchlistsAPIPath}`);

export default watchlistClient;
