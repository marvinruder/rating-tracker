import type { StatusAPI } from "@rating-tracker/backend/api/status";
import { statusAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const statusClient = hc<StatusAPI>(`${basePath}${statusAPIPath}`);

export default statusClient;
