import { Country, Industry, Size, Style } from "rating-tracker-commons";

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

  constructor({
    ticker,
    name,
    country,
    industry,
    size,
    style,
    morningstarId,
    starRating,
    dividendYieldPercent,
    priceEarningRatio,
  }) {
    this.ticker = ticker;
    this.name = name;
    this.country = country;
    this.industry = industry;
    this.size = size;
    this.style = style;
    this.morningstarId = morningstarId;
    this.starRating = starRating;
    this.dividendYieldPercent = dividendYieldPercent;
    this.priceEarningRatio = priceEarningRatio;
  }
}
