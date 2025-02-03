import type StatusController from "./status.controller";

export type StatusAPI = typeof StatusController.prototype.router;
