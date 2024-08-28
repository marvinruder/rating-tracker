import type StatusController from "@rating-tracker/backend/api/status";
import { statusAPIPath, baseURL } from "@rating-tracker/commons";
import { hc } from "hono/client";

const statusClient = hc<typeof StatusController.prototype.router>(`${baseURL}${statusAPIPath}`);

export default statusClient;
