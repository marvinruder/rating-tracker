import type ResourceController from "./resource.controller";

export type ResourceAPI = typeof ResourceController.prototype.router;
