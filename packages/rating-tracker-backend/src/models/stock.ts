import { Entity, Schema } from "redis-om";
import { Country, Industry, Size, Style } from "../types.js";

export class Stock {
  ticker: string;
  name: string;
  country?: Country;
  industry?: Industry;
  size?: Size;
  style?: Style;
  morningstarId?: string;
  starRating?: number;
  dividendYieldPercent?: number;
  priceEarningRatio?: number;

  constructor(stockEntity: StockEntity) {
    this.ticker = stockEntity.ticker;
    this.name = stockEntity.name;
    if (stockEntity.country != null) {
      this.country = stockEntity.country as Country;
    }
    if (stockEntity.industry != null) {
      this.industry = stockEntity.industry as Industry;
    }
    if (stockEntity.size != null) {
      this.size = stockEntity.size as Size;
    }
    if (stockEntity.style != null) {
      this.style = stockEntity.style as Style;
    }
    if (stockEntity.morningstarId != null) {
      this.morningstarId = stockEntity.morningstarId;
    }
    if (stockEntity.starRating != null) {
      this.starRating = stockEntity.starRating;
    }
    if (stockEntity.dividendYieldPercent != null) {
      this.dividendYieldPercent = stockEntity.dividendYieldPercent;
    }
    if (stockEntity.priceEarningRatio != null) {
      this.priceEarningRatio = stockEntity.priceEarningRatio;
    }
  }

  static toJSON = (stock: Stock) => {
    return {
      ticker: stock.ticker,
      name: stock.name,
      country: stock.country as string,
      industry: stock.industry as string,
      size: stock.size as string,
      style: stock.style as string,
      morningstarId: stock.morningstarId,
      starRating: stock.starRating,
      dividendYieldPercent: stock.dividendYieldPercent,
      priceEarningRatio: stock.priceEarningRatio,
    };
  };
}

export interface StockEntity {
  ticker: string;
  name: string;
  country: string;
  industry: string;
  size: string;
  style: string;
  morningstarId: string;
  starRating: number;
  dividendYieldPercent: number;
  priceEarningRatio: number;
}

export class StockEntity extends Entity {}

export const stockSchema = new Schema(StockEntity, {
  ticker: { type: "string" },
  name: { type: "text", sortable: true },
  country: { type: "string" },
  industry: { type: "string" },
  size: { type: "string" },
  style: { type: "string" },
  morningstarId: { type: "string" },
  starRating: { type: "number" },
  dividendYieldPercent: { type: "number" },
  priceEarningRatio: { type: "number" },
});
