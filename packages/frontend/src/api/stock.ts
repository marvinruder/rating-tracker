import type AccountController from "@rating-tracker/backend/api/stocks";
import { stocksAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const stockClient = hc<typeof AccountController.prototype.router>(`${basePath}${stocksAPIPath}`);

export default stockClient;
