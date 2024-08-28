import type FetchController from "@rating-tracker/backend/api/fetch";
import { fetchAPIPath, baseURL } from "@rating-tracker/commons";
import { hc } from "hono/client";

const fetchClient = hc<typeof FetchController.prototype.router>(`${baseURL}${fetchAPIPath}`);

export default fetchClient;
