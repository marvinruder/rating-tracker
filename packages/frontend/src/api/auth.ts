import type { AuthAPI } from "@rating-tracker/backend/api/auth";
import { authAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const authClient = hc<AuthAPI>(`${basePath}${authAPIPath}`);

export default authClient;
