import type AccountController from "@rating-tracker/backend/api/account";
import { accountAPIPath, baseURL } from "@rating-tracker/commons";
import { hc } from "hono/client";

const accountClient = hc<typeof AccountController.prototype.router>(`${baseURL}${accountAPIPath}`);

export default accountClient;
