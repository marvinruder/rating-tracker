import type { ProxyAPI } from "@rating-tracker/backend/api/proxy";
import { proxyAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const proxyClient = hc<ProxyAPI>(`${basePath}${proxyAPIPath}`);

export default proxyClient;
