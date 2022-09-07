import { Country } from "src/enums/country";
import { Industry } from "src/enums/industry";
import { Size } from "src/enums/size";
import { Style } from "src/enums/style";

export interface Stock {
  ticker: string;
  name: string;
  country: Country;
  industry: Industry;
  size: Size;
  style: Style;
}
