import type ResourceController from "@rating-tracker/backend/api/resources";
import { resourcesAPIPath, baseURL } from "@rating-tracker/commons";
import { hc } from "hono/client";

const resourceClient = hc<typeof ResourceController.prototype.router>(`${baseURL}${resourcesAPIPath}`);

export default resourceClient;
