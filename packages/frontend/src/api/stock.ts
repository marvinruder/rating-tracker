import type { StockAPI } from "@rating-tracker/backend/api/stocks";
import { stocksAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const stockClient = hc<StockAPI>(`${basePath}${stocksAPIPath}`);

export default stockClient;
