import type UserController from "@rating-tracker/backend/api/users";
import { usersAPIPath, baseURL } from "@rating-tracker/commons";
import { hc } from "hono/client";

const userClient = hc<typeof UserController.prototype.router>(`${baseURL}${usersAPIPath}`);

export default userClient;
