export const stockListColumnArray = [
  "Country",
  "Size and Style",
  "Sector",
  "Industry",
  "Total Score",
  "Financial Score",
  "ESG Score",
  "Star Rating",
  "Morningstar Fair Value",
  "Analyst Consensus",
  "Analyst Target Price",
  "MSCI ESG Rating",
  "MSCI Implied Temperature Rise",
  "Refinitiv ESG Information",
  "S&P ESG Score",
  "Sustainalytics ESG Risk",
  "52 Week Range",
  "Dividend Yield (%)",
  "P\u2009/\u2009E Ratio",
  "Market Capitalization",
] as const;

export type StockListColumn = typeof stockListColumnArray[number];
