import type AccountController from "@rating-tracker/backend/api/stocks";
import { stocksAPIPath, baseURL } from "@rating-tracker/commons";
import { hc } from "hono/client";

const stockClient = hc<typeof AccountController.prototype.router>(`${baseURL}${stocksAPIPath}`);

export default stockClient;
