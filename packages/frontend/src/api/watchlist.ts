import type { WatchlistAPI } from "@rating-tracker/backend/api/watchlists";
import { watchlistsAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const watchlistClient = hc<WatchlistAPI>(`${basePath}${watchlistsAPIPath}`);

export default watchlistClient;
