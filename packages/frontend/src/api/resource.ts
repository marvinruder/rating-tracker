import type { ResourceAPI } from "@rating-tracker/backend/api/resources";
import { resourcesAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const resourceClient = hc<ResourceAPI>(`${basePath}${resourcesAPIPath}`);

export default resourceClient;
