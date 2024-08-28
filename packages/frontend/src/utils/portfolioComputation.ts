import type { Region, Sector, Size, Stock, Style, WeightedStock } from "@rating-tracker/commons";
import {
  isRegion,
  isSector,
  isSize,
  isStyle,
  regionOfCountry,
  sectorOfIndustryGroup,
  groupOfIndustry,
} from "@rating-tracker/commons";
import hareNiemeyer from "hare-niemeyer";
import { fcnnls } from "ml-fcnnls";
import { Matrix } from "ml-matrix";
import sainteLague from "sainte-lague";

import type { ProportionalRepresentationAlgorithm } from "../types/ProportionalRepresentationAlgorithm";

/**
 * A small value to add to the diagonal of the constraint matrix.
 */
const EPSILON = 1e-6;

/**
 * Checks whether a stock has a certain property.
 * @param stock The stock to check.
 * @param property The property to check, which can be a region, sector, size or style.
 * @returns `true` if the stock has the property, `false` otherwise.
 */
const hasProperty = (stock: Stock, property: string): boolean => {
  switch (true) {
    case isRegion(property):
      return regionOfCountry[stock.country] === property;
    case isSector(property):
      /* c8 ignore next */ // We only test some properties of the stock object.
      return sectorOfIndustryGroup[groupOfIndustry[stock.industry!]] === property;
    case isSize(property):
      return stock.size === property;
    case isStyle(property):
      /* c8 ignore next */ // We only test some properties of the stock object.
      return stock.style === property;
    default: // This should never occur when called with the correct arguments.
      /* c8 ignore next */ return false;
  }
};

/**
 * Computes weights for a list of stocks, constraints for the proportions of regions, sectors, sizes and styles and
 * configuration options.
 * @param stocks The list of stocks to include.
 * @param constraints The constraints for the proportions of regions, sectors, sizes and styles.
 * @param options The configuration options.
 * @param options.totalAmount The sum of the amounts of all stocks in the portfolio.
 * @param options.minAmount The minimum amount of a single stock in the portfolio.
 * @param options.tick The rounding increment for the amount of each stock in the portfolio.
 * @param options.proportionalRepresentationAlgorithm The algorithm to use for proportional representation.
 * @returns The weighted stocks and the Root Squared Error (RSE) of the solution.
 */
export const computePortfolio = (
  stocks: Stock[],
  constraints: Partial<Record<Region | Sector | Size | Style, number>>,
  options: {
    totalAmount: number;
    minAmount: number;
    tick: number;
    proportionalRepresentationAlgorithm: ProportionalRepresentationAlgorithm;
  },
): {
  weightedStocks: WeightedStock[];
  rse: number;
} => {
  /**
   * The minimum weight of a single stock in the portfolio.
   */
  const minWeight = options.minAmount / options.totalAmount;

  /**
   * The matrix to solve the Least Squares problem for. It holds rows representing each constraint and columns
   * representing each stock. The value of each cell is 1 if the stock has the property value of the constraint and 0
   * otherwise.
   */
  const constraintMatrix: Matrix = new Matrix(0, stocks.length);

  /**
   * The response vector to solve the Least Squares problem for. It holds the percentage values of the constraints.
   */
  const targetVector: Matrix = new Matrix(0, 1);

  // We solve the NNLS problem with all target values reduced by the sum of the minimum weights assigned to all stocks
  // having the property value of the constraint. The resulting solution vector entries will then be increased by the
  // minimum weight to obtain the final weights. This way, we can ensure that all weighs are not just greater than or
  // equal to Zero, but also greater than or equal to the minimum weight.

  Object.entries(constraints).forEach(([key, value], index) => {
    // Add a row for every constraint to the matrix requiring that the weight of all stocks having the property value of
    // the constraint sum up to the desired percentage
    constraintMatrix.addRow(stocks.map((stock) => (hasProperty(stock, key) ? 1 : 0)));
    // The desired percentage is defined by the user via a constraint reduced by the sum of the minimum weights assigned
    // to all stocks having the property value of the constraint.
    targetVector.addRow([value - constraintMatrix.subMatrixRow([index]).sum() * minWeight]);
  });

  // We solve the NNLS problem after adding a diagonal matrix with small values to the constraint matrix and 0 for the
  // corresponding response vector entries. This damped system, taken from
  // https://math.stackexchange.com/questions/853459/rank-degenerate-non-negative-least-squares,
  // may help us find a more balanced solution.

  /**
   * The solution of the Non-Negative Least Squares (NNLS) problem with dampening.
   */
  const solution = fcnnls(
    new Matrix(constraintMatrix.rows + stocks.length, stocks.length)
      .setSubMatrix(constraintMatrix, 0, 0)
      .setSubMatrix(Matrix.eye(stocks.length, stocks.length, EPSILON), constraintMatrix.rows, 0),
    new Matrix(constraintMatrix.rows + stocks.length, 1).setSubMatrix(targetVector, 0, 0),
    { info: true },
  );

  /**
   * The Root Squared Error (RSE) of the solution.
   */
  const rse = Math.max(
    Matrix.subtract(constraintMatrix.mmul(solution.K), targetVector).norm("frobenius") - EPSILON ** 2,
    0,
  );

  /**
   * An object holding the rounded weights of the stocks, computed using the selected algorithm for proportional
   * representation.
   */
  const roundedWeights: { [key: string]: number } = (
    options.proportionalRepresentationAlgorithm === "sainteLague" ? sainteLague : hareNiemeyer
  )(
    Object.fromEntries(
      stocks.map((stock, index) => [stock.ticker, Math.round((solution.K.get(index, 0) + minWeight) / EPSILON)]),
    ),
    // Fix floating point precision errors. We validated before that the tick divides the total amount evenly.
    Math.round(options.totalAmount / options.tick),
    { draw: true },
  );

  return {
    weightedStocks: stocks.map((stock) => ({ ...stock, amount: roundedWeights[stock.ticker] * options.tick })),
    rse,
  };
};
