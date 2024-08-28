import type SessionController from "@rating-tracker/backend/api/session";
import { sessionAPIPath, baseURL } from "@rating-tracker/commons";
import { hc } from "hono/client";

const sessionClient = hc<typeof SessionController.prototype.router>(`${baseURL}${sessionAPIPath}`);

export default sessionClient;
