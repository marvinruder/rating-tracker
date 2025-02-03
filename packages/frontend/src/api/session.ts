import type { SessionAPI } from "@rating-tracker/backend/api/session";
import { sessionAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const sessionClient = hc<SessionAPI>(`${basePath}${sessionAPIPath}`);

export default sessionClient;
