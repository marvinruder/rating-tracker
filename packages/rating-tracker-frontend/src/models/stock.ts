import { Country } from "src/enums/regions/country";
import { Industry } from "src/enums/sectors/industry";
import { Size } from "src/enums/size";
import { Style } from "src/enums/style";

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
    this.country = Country[country];
    this.industry = Industry[industry];
    this.size = Size[size] as unknown as Size;
    this.style = Style[style] as unknown as Style;
    this.morningstarId = morningstarId;
    this.starRating = starRating;
    this.dividendYieldPercent = dividendYieldPercent;
    this.priceEarningRatio = priceEarningRatio;
  }
}
