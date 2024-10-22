import type UserController from "@rating-tracker/backend/api/users";
import { usersAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const userClient = hc<typeof UserController.prototype.router>(`${basePath}${usersAPIPath}`);

export default userClient;
