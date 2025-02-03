import type StockController from "./stock.controller";

export type StockAPI = typeof StockController.prototype.router;
