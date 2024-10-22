import type StatusController from "@rating-tracker/backend/api/status";
import { statusAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const statusClient = hc<typeof StatusController.prototype.router>(`${basePath}${statusAPIPath}`);

export default statusClient;
