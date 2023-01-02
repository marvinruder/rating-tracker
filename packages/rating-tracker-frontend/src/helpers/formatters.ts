import { Stock } from "rating-tracker-commons";

const formatMarketCap = (stock: Stock) => {
  if (stock.marketCap > 1e12) {
    return (stock.marketCap / 1e12).toPrecision(3) + " T";
  } else if (stock.marketCap > 1e9) {
    return (stock.marketCap / 1e9).toPrecision(3) + " B";
  } else if (stock.marketCap > 1e6) {
    return (stock.marketCap / 1e6).toPrecision(3) + " M";
  } else if (stock.marketCap > 1e3) {
    return (stock.marketCap / 1e3).toPrecision(3) + " k";
  } else {
    return stock.marketCap.toPrecision(3);
  }
};

export default formatMarketCap;
