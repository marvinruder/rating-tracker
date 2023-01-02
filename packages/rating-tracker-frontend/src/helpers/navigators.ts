import { Stock } from "rating-tracker-commons";

const navigateToMorningstar = (stock: Stock) => {
  stock.morningstarId &&
    window.open(
      `https://tools.morningstar.co.uk/uk/stockreport/default.aspx?Site=us&id=${stock.morningstarId}&LanguageId=en-US&SecurityToken=${stock.morningstarId}]3]0]E0WWE$$ALL`
    );
};

const navigateToMarketScreener = (stock: Stock) => {
  stock.marketScreenerId &&
    window.open(
      `https://www.marketscreener.com/quote/stock/${stock.marketScreenerId}/`
    );
};

const navigateToMSCI = (stock: Stock) => {
  stock.msciId &&
    window.open(
      `https://www.msci.com/our-solutions/esg-investing/esg-ratings-climate-search-tool/issuer/${stock.msciId}`
    );
};

const navigateToRefinitiv = (stock: Stock) => {
  stock.ric && navigator.clipboard.writeText(stock.name);
  window.open("https://www.refinitiv.com/en/sustainable-finance/esg-scores");
};

const navigateToSP = (stock: Stock) => {
  stock.spId &&
    window.open(
      `https://www.spglobal.com/esg/scores/results?cid=${String(stock.spId)}`
    );
};

const navigateToSustainalytics = (stock: Stock) => {
  stock.sustainalyticsId &&
    window.open(
      `https://www.sustainalytics.com/esg-rating/${stock.sustainalyticsId}`
    );
};

export {
  navigateToMorningstar,
  navigateToMarketScreener,
  navigateToMSCI,
  navigateToRefinitiv,
  navigateToSP,
  navigateToSustainalytics,
};
