import type UserController from "./user.controller";

export type UserAPI = typeof UserController.prototype.router;
