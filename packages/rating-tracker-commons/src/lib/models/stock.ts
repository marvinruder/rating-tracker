import { Currency } from "../Currency.js";
import { Country } from "../geo/Country.js";
import { Industry } from "../gics/Industry.js";
import { MSCIESGRating } from "../ratings/MSCI.js";
import { Size } from "../stylebox/Size.js";
import { Style } from "../stylebox/Style.js";

export class Stock {
  ticker: string;
  name: string;
  country?: Country;
  industry?: Industry;
  size?: Size;
  style?: Style;
  morningstarId?: string;
  morningstarLastFetch?: Date;
  starRating?: number;
  dividendYieldPercent?: number;
  priceEarningRatio?: number;
  currency?: Currency;
  lastClose?: number;
  morningstarFairValue?: number;
  marketCap?: number;
  low52w?: number;
  high52w?: number;
  msciId?: string;
  msciLastFetch?: Date;
  msciESGRating?: MSCIESGRating;
  msciTemperature?: number;
}
