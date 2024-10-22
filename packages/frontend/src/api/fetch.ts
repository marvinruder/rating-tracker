import type FetchController from "@rating-tracker/backend/api/fetch";
import { fetchAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const fetchClient = hc<typeof FetchController.prototype.router>(`${basePath}${fetchAPIPath}`);

export default fetchClient;
