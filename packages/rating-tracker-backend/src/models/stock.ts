import { Entity, Schema } from "redis-om";
import {
  Country,
  Currency,
  Industry,
  MSCIESGRating,
  Size,
  Stock as CommonsStock,
  Style,
} from "rating-tracker-commons";

export class Stock extends CommonsStock {
  constructor(stockEntity: StockEntity) {
    super();
    this.ticker = stockEntity.entityId;
    this.name = stockEntity.name;
    this.isin = stockEntity.isin;
    if (stockEntity.country != null)
      this.country = stockEntity.country as Country;
    if (stockEntity.industry != null)
      this.industry = stockEntity.industry as Industry;
    if (stockEntity.size != null) this.size = stockEntity.size as Size;
    if (stockEntity.style != null) this.style = stockEntity.style as Style;
    if (stockEntity.morningstarId != null)
      this.morningstarId = stockEntity.morningstarId;
    if (stockEntity.morningstarLastFetch != null)
      this.morningstarLastFetch = stockEntity.morningstarLastFetch;
    if (stockEntity.starRating != null)
      this.starRating = stockEntity.starRating;
    if (stockEntity.dividendYieldPercent != null)
      this.dividendYieldPercent = stockEntity.dividendYieldPercent;
    if (stockEntity.priceEarningRatio != null)
      this.priceEarningRatio = stockEntity.priceEarningRatio;
    if (stockEntity.currency != null)
      this.currency = stockEntity.currency as Currency;
    if (stockEntity.lastClose != null) this.lastClose = stockEntity.lastClose;
    if (stockEntity.morningstarFairValue != null)
      this.morningstarFairValue = stockEntity.morningstarFairValue;
    if (stockEntity.marketCap != null) this.marketCap = stockEntity.marketCap;
    if (stockEntity.low52w != null) this.low52w = stockEntity.low52w;
    if (stockEntity.high52w != null) this.high52w = stockEntity.high52w;
    if (stockEntity.marketScreenerId != null)
      this.marketScreenerId = stockEntity.marketScreenerId;
    if (stockEntity.marketScreenerLastFetch != null)
      this.marketScreenerLastFetch = stockEntity.marketScreenerLastFetch;
    if (stockEntity.analystConsensus != null)
      this.analystConsensus = stockEntity.analystConsensus;
    if (stockEntity.analystCount != null)
      this.analystCount = stockEntity.analystCount;
    if (stockEntity.analystTargetPrice != null)
      this.analystTargetPrice = stockEntity.analystTargetPrice;
    if (stockEntity.msciId != null) this.msciId = stockEntity.msciId;
    if (stockEntity.msciLastFetch != null)
      this.msciLastFetch = stockEntity.msciLastFetch;
    if (stockEntity.msciESGRating != null)
      this.msciESGRating = stockEntity.msciESGRating as MSCIESGRating;
    if (stockEntity.msciTemperature != null)
      this.msciTemperature = stockEntity.msciTemperature;
    if (stockEntity.ric != null) this.ric = stockEntity.ric;
    if (stockEntity.refinitivLastFetch != null)
      this.refinitivLastFetch = stockEntity.refinitivLastFetch;
    if (stockEntity.refinitivESGScore != null)
      this.refinitivESGScore = stockEntity.refinitivESGScore;
    if (stockEntity.refinitivEmissions != null)
      this.refinitivEmissions = stockEntity.refinitivEmissions;
    if (stockEntity.spId != null) this.spId = stockEntity.spId;
    if (stockEntity.spLastFetch != null)
      this.spLastFetch = stockEntity.spLastFetch;
    if (stockEntity.spESGScore != null)
      this.spESGScore = stockEntity.spESGScore;
    if (stockEntity.sustainalyticsId != null)
      this.sustainalyticsId = stockEntity.sustainalyticsId;
    if (stockEntity.sustainalyticsESGRisk != null)
      this.sustainalyticsESGRisk = stockEntity.sustainalyticsESGRisk;
  }
}

export interface StockEntity {
  name: string;
  country: string;
  isin: string;
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
  marketScreenerId: string;
  marketScreenerLastFetch: Date;
  analystConsensus: number;
  analystCount: number;
  analystTargetPrice: number;
  msciId: string;
  msciLastFetch: Date;
  msciESGRating: string;
  msciTemperature: number;
  ric: string;
  refinitivLastFetch: Date;
  refinitivESGScore: number;
  refinitivEmissions: number;
  spId: number;
  spLastFetch: Date;
  spESGScore: number;
  sustainalyticsId: string;
  sustainalyticsESGRisk: number;
}

export class StockEntity extends Entity {}

export const stockSchema = new Schema(StockEntity, {
  name: { type: "text", sortable: true },
  country: { type: "string" },
  isin: { type: "string" },
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
  marketScreenerId: { type: "string" },
  marketScreenerLastFetch: { type: "date" },
  analystConsensus: { type: "number" },
  analystCount: { type: "number" },
  analystTargetPrice: { type: "number" },
  msciId: { type: "string" },
  msciLastFetch: { type: "date" },
  msciESGRating: { type: "string" },
  msciTemperature: { type: "number" },
  ric: { type: "string" },
  refinitivLastFetch: { type: "date" },
  refinitivESGScore: { type: "number" },
  refinitivEmissions: { type: "number" },
  spId: { type: "number" },
  spLastFetch: { type: "date" },
  spESGScore: { type: "number" },
  sustainalyticsId: { type: "string" },
  sustainalyticsESGRisk: { type: "number" },
});
