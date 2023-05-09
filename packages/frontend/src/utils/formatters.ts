import { OmitDynamicAttributesStock } from "@rating-tracker/commons";

/**
 * Formats the market capitalization of a stock to a human readable format.
 *
 * @param {Stock} stock The stock to format the market capitalization of.
 * @returns {string} The formatted market capitalization.
 */
const formatMarketCap = (stock: OmitDynamicAttributesStock): string => {
  if (stock.marketCap > 1e12) {
    return (stock.marketCap / 1e12).toPrecision(3) + " T"; // trillion, rounded to 3 significant digits
  } else if (stock.marketCap > 1e9) {
    return (stock.marketCap / 1e9).toPrecision(3) + " B"; // billion, rounded to 3 significant digits
  } else if (stock.marketCap > 1e6) {
    return (stock.marketCap / 1e6).toPrecision(3) + " M"; // million, rounded to 3 significant digits
  } else if (stock.marketCap > 1e3) {
    return (stock.marketCap / 1e3).toPrecision(3) + " k"; // thousand, rounded to 3 significant digits
  } else {
    return stock.marketCap.toFixed(0); // rounded to 0 decimal places
  }
};

export default formatMarketCap;
