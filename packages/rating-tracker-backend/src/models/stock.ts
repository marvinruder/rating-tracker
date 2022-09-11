import { Entity, Schema } from "redis-om";
import { Country } from "../enums/country.js";
import { Industry } from "../enums/industry.js";
import { Size } from "../enums/size.js";
import { Style } from "../enums/style.js";

export class Stock {
  ticker: string;
  name: string;
  country: Country;
  industry: Industry;
  size: Size;
  style: Style;

  constructor(stockEntity: StockEntity) {
    this.ticker = stockEntity.toJSON()["ticker"];
    this.name = stockEntity.toJSON()["name"];
    this.country = stockEntity.toJSON()["country"] as Country;
    this.industry = stockEntity.toJSON()["industry"] as Industry;
    this.size = stockEntity.toJSON()["size"] as Size;
    this.style = stockEntity.toJSON()["style"] as Style;
  }

  static toJSON = (stock: Stock) => {
    return {
      ticker: stock.ticker,
      name: stock.name,
      country: stock.country as string,
      industry: stock.industry as string,
      size: stock.size as string,
      style: stock.style as string,
    };
  };
}

export class StockEntity extends Entity {}

export const stockSchema = new Schema(StockEntity, {
  ticker: { type: "string" },
  name: { type: "text" },
  country: { type: "string" },
  industry: { type: "string" },
  size: { type: "string" },
  style: { type: "string" },
});
