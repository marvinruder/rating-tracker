import type SessionController from "./session.controller";

export type SessionAPI = typeof SessionController.prototype.router;
