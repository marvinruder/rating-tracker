import type ResourceController from "@rating-tracker/backend/api/resources";
import { resourcesAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const resourceClient = hc<typeof ResourceController.prototype.router>(`${basePath}${resourcesAPIPath}`);

export default resourceClient;
