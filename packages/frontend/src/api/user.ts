import type { UserAPI } from "@rating-tracker/backend/api/users";
import { usersAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const userClient = hc<UserAPI>(`${basePath}${usersAPIPath}`);

export default userClient;
