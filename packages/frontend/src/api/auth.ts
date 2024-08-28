import type AuthController from "@rating-tracker/backend/api/auth";
import { authAPIPath, baseURL } from "@rating-tracker/commons";
import { hc } from "hono/client";

const authClient = hc<typeof AuthController.prototype.router>(`${baseURL}${authAPIPath}`);

export default authClient;
