import type EmailController from "./email.controller";

export type EmailAPI = typeof EmailController.prototype.router;
