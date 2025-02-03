import type AccountController from "./account.controller";

export type AccountAPI = typeof AccountController.prototype.router;
