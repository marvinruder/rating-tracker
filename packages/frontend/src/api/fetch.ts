import type { FetchAPI } from "@rating-tracker/backend/api/fetch";
import { fetchAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const fetchClient = hc<FetchAPI>(`${basePath}${fetchAPIPath}`);

export default fetchClient;
