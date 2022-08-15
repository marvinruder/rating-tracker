import { Country } from "src/enums/regions/country";
import { Industry } from "src/enums/sectors/industry";

export interface Stock {
  ticker: string;
  name: string;
  country: Country;
  industry: Industry;
}
