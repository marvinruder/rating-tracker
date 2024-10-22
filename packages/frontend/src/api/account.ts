import type AccountController from "@rating-tracker/backend/api/account";
import { accountAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const accountClient = hc<typeof AccountController.prototype.router>(`${basePath}${accountAPIPath}`);

export default accountClient;
