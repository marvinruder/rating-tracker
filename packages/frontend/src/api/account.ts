import type { AccountAPI } from "@rating-tracker/backend/api/account";
import { accountAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const accountClient = hc<AccountAPI>(`${basePath}${accountAPIPath}`);

export default accountClient;
