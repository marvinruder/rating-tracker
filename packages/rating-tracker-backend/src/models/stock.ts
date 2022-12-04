import { Entity, Schema } from "redis-om";
import {
  Country,
  Currency,
  Industry,
  Size,
  Stock as CommonsStock,
  Style,
} from "rating-tracker-commons";

export class Stock extends CommonsStock {
  constructor(stockEntity: StockEntity) {
    super();
    this.ticker = stockEntity.entityId;
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
    if (stockEntity.morningstarLastFetch != null) {
      this.morningstarLastFetch = stockEntity.morningstarLastFetch;
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
    if (stockEntity.currency != null) {
      this.currency = stockEntity.currency as Currency;
    }
    if (stockEntity.lastClose != null) {
      this.lastClose = stockEntity.lastClose;
    }
    if (stockEntity.morningstarFairValue != null) {
      this.morningstarFairValue = stockEntity.morningstarFairValue;
    }
    if (stockEntity.marketCap != null) {
      this.marketCap = stockEntity.marketCap;
    }
    if (stockEntity.low52w != null) {
      this.low52w = stockEntity.low52w;
    }
    if (stockEntity.high52w != null) {
      this.high52w = stockEntity.high52w;
    }
  }
}

export interface StockEntity {
  name: string;
  country: string;
  industry: string;
  size: string;
  style: string;
  morningstarId: string;
  morningstarLastFetch: Date;
  starRating: number;
  dividendYieldPercent: number;
  priceEarningRatio: number;
  currency: string;
  lastClose: number;
  morningstarFairValue: number;
  marketCap: number;
  low52w: number;
  high52w: number;
}

export class StockEntity extends Entity {}

export const stockSchema = new Schema(StockEntity, {
  name: { type: "text", sortable: true },
  country: { type: "string" },
  industry: { type: "string" },
  size: { type: "string" },
  style: { type: "string" },
  morningstarId: { type: "string" },
  morningstarLastFetch: { type: "date" },
  starRating: { type: "number" },
  dividendYieldPercent: { type: "number" },
  priceEarningRatio: { type: "number" },
  currency: { type: "string" },
  lastClose: { type: "number" },
  morningstarFairValue: { type: "number" },
  marketCap: { type: "number" },
  low52w: { type: "number" },
  high52w: { type: "number" },
});
