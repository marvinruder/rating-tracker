import type { Currency } from "../Currency";
import type { Industry } from "../gecs/Industry";
import { isIndustry, industryName } from "../gecs/Industry";
import type { IndustryGroup } from "../gecs/IndustryGroup";
import { isIndustryGroup, groupOfIndustry, industryGroupName } from "../gecs/IndustryGroup";
import type { Sector } from "../gecs/Sector";
import { isSector, sectorName, sectorOfIndustryGroup } from "../gecs/Sector";
import type { SuperSector } from "../gecs/SuperSector";
import { isSuperSector, superSectorName, superSectorOfSector } from "../gecs/SuperSector";
import { countryName, isCountry } from "../geo/Country";
import { isRegion, regionName, regionOfCountry } from "../geo/Region";
import { isSuperRegion, superRegionName, superRegionOfRegion } from "../geo/SuperRegion";
import { RecordMath } from "../math/Record";
import type { AnalystRating } from "../ratings/AnalystRating";
import { analystRatingArray } from "../ratings/AnalystRating";
import type { MSCIESGRating } from "../ratings/MSCI";
import { msciESGRatingArray } from "../ratings/MSCI";
import type { Size } from "../stylebox/Size";
import type { Style } from "../stylebox/Style";

import type { Stock } from "./stock";

/**
 * A stock associated with an amount of a specified currency.
 */
export type WeightedStock = Stock & {
  /**
   * The amount of currency associated with the stock.
   */
  amount: number;
};

/**
 * A named collection of stocks, each associated with an amount of a specified currency.
 */
export type Portfolio = {
  /**
   * A unique identifier of the portfolio.
   */
  id: number;
  /**
   * The name of the portfolio.
   */
  name: string;
  /**
   * The currency associated with the portfolio.
   */
  currency: Currency;
  /**
   * The list of weighted stocks composing the portfolio.
   */
  stocks: WeightedStock[];
};

/**
 * A named collection of stocks, each associated with an amount of a specified currency. Includes only the tickers and
 * amounts of the stocks, but not the full stock objects themselves.
 */
export type PortfolioSummary = Omit<Portfolio, "stocks"> & {
  /**
   * The list of stocks on the portfolio. Includes only the tickers of the stocks with their associated amounts.
   */
  stocks: Pick<WeightedStock, "ticker" | "amount">[];
};

/**
 * The raw data from which a portfolio can be created. Does not include an ID or a name.
 */
export type PortfolioRawData = Omit<Portfolio, "id" | "name">;

/**
 * Computes the total currency amount of the stocks in a portfolio. If an attribute is specified, only the stocks with a
 * non-null value for that attribute are considered.
 * @param portfolio The portfolio.
 * @param attribute The attribute to use for filtering the stocks.
 * @returns The total currency amount of the stocks in the portfolio.
 */
export const getTotalAmount = (portfolio: Pick<PortfolioSummary, "stocks">, attribute?: keyof Stock): number =>
  portfolio.stocks.filter((stock) => stock[attribute] !== null).reduce((sum, stock) => sum + stock.amount, 0);

/**
 * Computes the weighted average value of a numeric attribute of the stocks in a portfolio. Stocks with a null value for
 * the attribute are ignored.
 * @param portfolio The portfolio.
 * @param attribute The attribute to use for computing the weighted average.
 * @returns The weighted average value of the attribute of the stocks in the portfolio.
 */
export const getWeightedAverage = <
  T extends {
    [K in keyof Stock]: Stock[K] extends number ? K : never;
  }[keyof Stock],
>(
  portfolio: Portfolio,
  attribute: T,
): Stock[T] | null => {
  const totalAmount = getTotalAmount(portfolio, attribute);
  if (totalAmount === 0) {
    return null;
  }
  return (
    portfolio.stocks
      .filter((stock) => stock[attribute] !== null)
      .reduce((sum, stock) => sum + stock[attribute] * stock.amount, 0) / totalAmount
  );
};

/**
 * Computes the estimated value of all stocks in a portfolio based on their amounts and the fair price estimation for
 * it. The estimation will be taken from the given attribute. If a stock does not have a value for the given attribute
 * or no last close price, its amount in the portfolio will be used in the computation.
 * @param portfolio The portfolio.
 * @param attribute The attribute to use for computing the estimated value.
 * @returns The estimated value of the portfolio. `null` if no stock has a value for the given
 *                          attribute.
 */
export const getEstimateValue = <T extends keyof Pick<Stock, "morningstarFairValue" | "analystTargetPrice">>(
  portfolio: Portfolio,
  attribute: T,
): number | null =>
  getTotalAmount(portfolio, attribute) === 0
    ? null
    : portfolio.stocks.reduce(
        (sum, stock) =>
          sum +
          // If both values are present, we divide the attribute value by the last close price.
          // If only one value is present, the ratio is 1 because we either divide the attribute value by itself or the
          // last close price by itself.
          // If neither value is present, the ratio is 1 because we divide 1 by 1.
          (stock.amount * (stock[attribute] ?? stock.lastClose ?? 1)) / (stock.lastClose ?? stock[attribute] ?? 1),
        0,
      );

/**
 * Computes the percentage difference between the total currency amount of the stocks and the estimated value of the
 * portfolio. The estimation will be taken from the given attribute.
 * @param portfolio The portfolio.
 * @param attribute The attribute to use for computing the estimated value.
 * @returns The percentage difference between the total currency amount of the stocks and the estimated
 *                          value of the portfolio. `null` if no stock has a value for the given attribute.
 */
export const getPercentageToTotalAmount = <T extends keyof Pick<Stock, "morningstarFairValue" | "analystTargetPrice">>(
  portfolio: Portfolio,
  attribute: T,
): number | null => {
  const estimateValue = getEstimateValue(portfolio, attribute);
  return estimateValue ? 100 * (getTotalAmount(portfolio) / estimateValue - 1) : null;
};

/**
 * Computes the analyst rating distribution of the stocks in a portfolio. Stocks with no Analyst Consensus are ignored.
 * @param portfolio The portfolio.
 * @returns The analyst rating distribution of the stocks in the portfolio. `null` if no stock has an Analyst Consensus.
 */
export const getAnalystRatingDistribution = (portfolio: Portfolio): Record<AnalystRating, number> | null => {
  const totalAmount = getTotalAmount(portfolio, "analystRatings");
  if (totalAmount === 0) return null;

  return portfolio.stocks
    .filter((stock) => stock.analystRatings)
    .reduce<Record<AnalystRating, number>>(
      (distribution, stock) => {
        const sum = RecordMath.sum(stock.analystRatings);
        Object.entries(stock.analystRatings).forEach(
          ([rating, value]) => (distribution[rating] += (Number(value) * stock.amount) / (totalAmount * sum)),
        );
        return distribution;
      },
      { Sell: 0, Underperform: 0, Hold: 0, Outperform: 0, Buy: 0 },
    );
};

/**
 * Computes the weighted mean value of the analyst ratings of the stocks in a portfolio. Stocks with no analyst
 * ratings are ignored.
 * @param portfolio The portfolio.
 * @returns The weighted mean of the analyst ratings of the stocks in the portfolio.
 */
export const getWeightedMeanAnalystConsensus = (portfolio: Portfolio): AnalystRating | null => {
  const analystRatingDistribution = getAnalystRatingDistribution(portfolio);
  if (analystRatingDistribution === null) return null;
  const sum = RecordMath.sum(analystRatingDistribution); // should be 1, but we add it here just in case

  let cumulativeSum = 0;
  for (const analystRating of analystRatingArray) {
    cumulativeSum += analystRatingDistribution[analystRating];
    if (cumulativeSum >= 0.5 * sum) return analystRating;
  }
  /* c8 ignore next */ // Unreachable, since we compare against the distribution’s sum, so the loop will always return.
};

/**
 * Computes the weighted average value of the MSCI ESG Rating of the stocks in a portfolio. Stocks with no MSCI ESG
 * Rating are ignored.
 * @param portfolio The portfolio.
 * @returns The weighted average MSCI ESG Rating of the stocks in the portfolio.
 */
export const getWeightedAverageMSCIESGRating = (portfolio: Portfolio): MSCIESGRating | null => {
  const totalAmount = getTotalAmount(portfolio, "msciESGRating");
  if (totalAmount === 0) return null;

  return msciESGRatingArray[
    Math.round(
      portfolio.stocks
        .filter((stock) => stock.msciESGRating !== null)
        .reduce((sum, stock) => sum + msciESGRatingArray.indexOf(stock.msciESGRating) * stock.amount, 0) / totalAmount,
    )
  ];
};

/**
 * Computes the percentages of stocks of every size and style combination in a portfolio weighted by their amounts.
 * @param portfolio The portfolio.
 * @returns A record of the computed percentages.
 */
export const getWeightedStylebox = (portfolio: Portfolio): Record<`${Size}-${Style}`, number> => {
  const totalAmount = getTotalAmount(portfolio);
  return portfolio.stocks
    .filter((stock) => stock.size !== null && stock.style !== null)
    .reduce<Record<`${Size}-${Style}`, number>>(
      (sums, stock) => ({
        ...sums,
        [`${stock.size}-${stock.style}`]: sums[`${stock.size}-${stock.style}`] + stock.amount / totalAmount,
      }),
      {
        "Large-Value": 0,
        "Large-Blend": 0,
        "Large-Growth": 0,
        "Mid-Value": 0,
        "Mid-Blend": 0,
        "Mid-Growth": 0,
        "Small-Value": 0,
        "Small-Blend": 0,
        "Small-Growth": 0,
      },
    );
};

/**
 * A data type from which a sunburst chart can be generated.
 */
export type SunburstNode = {
  /**
   * The unique identifier of the node.
   */
  id: string;
  /**
   * The name of the node.
   */
  name: string;
} & (
  | {
      /**
       * The children of the node, having the same data type.
       */
      children: SunburstNode[];
    }
  | {
      /**
       * The value of the node.
       */
      value: number;
    }
);

/**
 * Computes an object from which the regions of the stocks in a portfolio can be visualized in a sunburst chart.
 * @param portfolio The portfolio.
 * @returns The object holding the data for the sunburst chart.
 */
export const getCountrySunburstData = (portfolio: Portfolio): SunburstNode => {
  const data: SunburstNode = {
    id: "root",
    name: "All Countries",
    children: [],
  };

  portfolio.stocks.forEach((stock) => {
    const { country } = stock;
    const region = regionOfCountry[country];
    const superRegion = superRegionOfRegion[region];

    let superRegionNode: SunburstNode | undefined;
    do {
      superRegionNode = data.children.find((node) => node.id === superRegion);
      // Check if a child node for the super region already exists. If not, create and add it.
      if (superRegionNode === undefined) {
        data.children.push({ id: superRegion, name: superRegionName[superRegion], children: [] });
      }
      // If the super region node was newly created, we go through the loop again to find it in the children array.
    } while (superRegionNode === undefined);
    if (!("children" in superRegionNode)) throw new Error("Unable to add region node to super region node");

    let regionNode: SunburstNode | undefined;
    do {
      regionNode = superRegionNode.children.find((node) => node.id === region);
      // Check if a child node for the region already exists. If not, create and add it.
      if (regionNode === undefined) {
        superRegionNode.children.push({ id: region, name: regionName[region], children: [] });
      }
      // If the region node was newly created, we go through the loop again to find it in the children array.
    } while (regionNode === undefined);
    if (!("children" in regionNode)) throw new Error("Unable to add country node to region node");

    let countryNode: SunburstNode | undefined;
    do {
      countryNode = regionNode.children.find((node) => node.id === country);
      // Check if a child node for the country already exists. If not, create and add it.
      if (countryNode === undefined) {
        regionNode.children.push({ id: country, name: countryName[country], value: 0 });
      }
      // If the country node was newly created, we go through the loop again to find it in the children array.
    } while (countryNode === undefined);
    if (!("value" in countryNode)) throw new Error("Unable to add value to country node");

    // Increase the value of the country node by the amount of the stock.
    countryNode.value += stock.amount;
  });

  // Sort super regions in the order “The Americas”, “Greater Europe”, “Greater Asia” (by name descending)
  data.children.sort((a, b) => b.name.localeCompare(a.name));

  return data;
};

/**
 * Computes an object from which the industry sectors of the stocks in a portfolio can be visualized in a sunburst
 * chart.
 * Since IDs of sunburst nodes must be unique and an industry sector identifier can be used on multiple levels (e.g.
 * “Semicoductors” is both an industry group and an industry), the node IDs are prefixed with the level of the node.
 * @param portfolio The portfolio.
 * @returns The object holding the data for the sunburst chart.
 */
export const getIndustrySunburstData = (portfolio: Portfolio): SunburstNode => {
  const data: SunburstNode = {
    id: "root",
    name: "All Industries",
    children: [],
  };

  portfolio.stocks
    // Only consider stocks with an industry.
    .filter((stock) => stock.industry)
    .forEach((stock) => {
      const { industry } = stock;
      const industryGroup = groupOfIndustry[industry];
      const sector = sectorOfIndustryGroup[industryGroup];
      const superSector = superSectorOfSector[sector];

      let superSectorNode: SunburstNode | undefined;
      do {
        superSectorNode = data.children.find((node) => node.id === "SuperSector" + superSector);
        // Check if a child node for the super sector already exists. If not, create and add it in the correct order.
        if (superSectorNode === undefined) {
          data.children.push({ id: "SuperSector" + superSector, name: superSectorName[superSector], children: [] });
          data.children.sort((a, b) => a.id.localeCompare(b.id));
        }
        // If the super sector node was newly created, we go through the loop again to find it in the children array.
      } while (superSectorNode === undefined);
      if (!("children" in superSectorNode)) throw new Error("Unable to add sector node to super sector node");

      let sectorNode: SunburstNode | undefined;
      do {
        sectorNode = superSectorNode.children.find((node) => node.id === "Sector" + sector);
        // Check if a child node for the sector already exists. If not, create and add it in the correct order.
        if (sectorNode === undefined) {
          superSectorNode.children.push({ id: "Sector" + sector, name: sectorName[sector], children: [] });
          superSectorNode.children.sort((a, b) => a.id.localeCompare(b.id));
        }
        // If the sector node was newly created, we go through the loop again to find it in the children array.
      } while (sectorNode === undefined);
      if (!("children" in sectorNode)) throw new Error("Unable to add industry group node to sector node");

      let industryGroupNode: SunburstNode | undefined;
      do {
        industryGroupNode = sectorNode.children.find((node) => node.id === "IndustryGroup" + industryGroup);
        // Check if a child node for the industry group already exists. If not, create and add it in the correct order.
        if (industryGroupNode === undefined) {
          sectorNode.children.push({
            id: "IndustryGroup" + industryGroup,
            name: industryGroupName[industryGroup],
            children: [],
          });
          sectorNode.children.sort((a, b) => a.id.localeCompare(b.id));
        }
        // If the industry group node was newly created, we go through the loop again to find it in the children array.
      } while (industryGroupNode === undefined);
      if (!("children" in industryGroupNode)) throw new Error("Unable to add industry node to industry group node");

      let industryNode: SunburstNode | undefined;
      do {
        industryNode = industryGroupNode.children.find((node) => node.id === "Industry" + industry);
        // Check if a child node for the industry already exists. If not, create and add it in the correct order.
        if (industryNode === undefined) {
          industryGroupNode.children.push({ id: "Industry" + industry, name: industryName[industry], value: 0 });
          industryGroupNode.children.sort((a, b) => a.id.localeCompare(b.id));
        }
        // If the industry node was newly created, we go through the loop again to find it in the children array.
      } while (industryNode === undefined);
      if (!("value" in industryNode)) throw new Error("Unable to add value to industry node");

      // Increase the value of the industry node by the amount of the stock.
      industryNode.value += stock.amount;
    });

  return data;
};

/**
 * Removes the prefix indicating the level (`SuperSector`, `Sector`, `IndustryGroup`, or `Industry`) of a sunburst node
 * from its ID. If the stripped ID is neither a super sector, a sector, an industry group, nor an industry, `undefined`
 * is returned.
 * @param sunburstID The prefixed ID of the sunburst node.
 * @returns The stripped ID of the sunburst node.
 */
export const stripPrefixFromSunburstID = (
  sunburstID: string | undefined,
): SuperSector | Sector | IndustryGroup | Industry | undefined => {
  if (!sunburstID) return undefined;
  let id = sunburstID.replace(/^SuperSector/, "");
  if (isSuperSector(id)) return id;
  id = sunburstID.replace(/^Sector/, "");
  if (isSector(id)) return id;
  id = sunburstID.replace(/^IndustryGroup/, "");
  if (isIndustryGroup(id)) return id;
  id = sunburstID.replace(/^Industry/, "");
  if (isIndustry(id)) return id;
  return undefined;
};

/**
 * Resolves the name of a country or industry sector sunburst node from its ID, which in the case of an industry sector
 * node may be prefixed with the node’s level (`SuperSector`, `Sector`, `IndustryGroup`, or `Industry`).
 * @param id The (possibly prefixed) ID of the sunburst node, holding either country or industry sector data.
 * @returns The name of the sunburst node.
 */
export const getSunburstDatumName = (id: string): string => {
  const gecsID = stripPrefixFromSunburstID(id);
  return gecsID
    ? isSuperSector(gecsID)
      ? superSectorName[gecsID]
      : isSector(gecsID)
        ? sectorName[gecsID]
        : isIndustryGroup(gecsID)
          ? industryGroupName[gecsID]
          : isIndustry(gecsID)
            ? industryName[gecsID]
            : /* c8 ignore next */ // Unreachable due to the nature of `stripPrefixFromSunburstID`.
              gecsID
    : isSuperRegion(id)
      ? superRegionName[id]
      : isRegion(id)
        ? regionName[id]
        : isCountry(id)
          ? countryName[id]
          : id;
};
