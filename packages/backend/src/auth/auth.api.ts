import type AuthController from "./auth.controller";

export type AuthAPI = typeof AuthController.prototype.router;
