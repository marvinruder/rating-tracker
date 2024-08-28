import type ProxyController from "@rating-tracker/backend/api/proxy";
import { proxyAPIPath, baseURL } from "@rating-tracker/commons";
import { hc } from "hono/client";

const proxyClient = hc<typeof ProxyController.prototype.router>(`${baseURL}${proxyAPIPath}`);

export default proxyClient;
