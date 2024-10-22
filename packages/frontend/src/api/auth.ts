import type AuthController from "@rating-tracker/backend/api/auth";
import { authAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const authClient = hc<typeof AuthController.prototype.router>(`${basePath}${authAPIPath}`);

export default authClient;
