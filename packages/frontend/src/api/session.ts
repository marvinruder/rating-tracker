import type SessionController from "@rating-tracker/backend/api/session";
import { sessionAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const sessionClient = hc<typeof SessionController.prototype.router>(`${basePath}${sessionAPIPath}`);

export default sessionClient;
