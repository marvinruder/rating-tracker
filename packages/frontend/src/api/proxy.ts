import type ProxyController from "@rating-tracker/backend/api/proxy";
import { proxyAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const proxyClient = hc<typeof ProxyController.prototype.router>(`${basePath}${proxyAPIPath}`);

export default proxyClient;
