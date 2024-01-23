import { Box, Tooltip } from "@mui/material";
import type { Currency, OmitDynamicAttributesStock } from "@rating-tracker/commons";
import { currencyMinorUnits, currencyName } from "@rating-tracker/commons";

/**
 * Formats the market capitalization of a stock to a human readable format.
 *
 * @param {Stock} stock The stock to format the market capitalization of.
 * @returns {string} The formatted market capitalization.
 */
export const formatMarketCap = (stock: OmitDynamicAttributesStock): string => {
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

/**
 * Formats a decimal number to a percentage with 3 significant digits.
 *
 * @param {number | undefined | null} decimal The decimal number to format.
 * @param {object} options The options to use for formatting.
 * @param {number} options.total The total number to calculate the percentage from. Defaults to 1.
 * @param {number} options.precision The number of significant digits to round to. Defaults to 3.
 * @param {boolean} options.forceSign Whether to add a “+” sign in front of positive numbers. Defaults to false.
 * @param {string} options.fallbackString The string to return if the decimal is `NaN`, `undefined` or `null`.
 *                                        Defaults to `–`.
 * @returns {string} The formatted percentage.
 */
export const formatPercentage = (
  decimal: number | undefined | null,
  options?: { total?: number; precision?: number; forceSign?: boolean; fallbackString?: string },
): string => {
  const { total = 1, precision = 3, forceSign = false, fallbackString = "–" } = options || {};
  return decimal
    ? `${forceSign && decimal > 0 ? "+" : ""}${Number(((100 * decimal) / total).toPrecision(precision))}\u2009%`
    : fallbackString;
};

/* c8 ignore start */ // We currently do not have a test setup for JSX components.
/**
 * This component formats a currency value using the currency’s minor units as the number of decimal places. It adds a
 * tooltip with the full currency name to the ISO 4217 currency code.
 *
 * @param {CurrencyWithTooltipProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const CurrencyWithTooltip = (props: CurrencyWithTooltipProps): JSX.Element =>
  props.floatAlign ? (
    <>
      <Tooltip title={props.currency && currencyName[props.currency]} arrow>
        <Box sx={{ float: "left" }} display="inline-block">
          {props.currency ?? ""}
        </Box>
      </Tooltip>
      <Box sx={{ float: "right" }}>
        {(props.currency && props.value?.toFixed(currencyMinorUnits[props.currency])) ?? "–"}
      </Box>
    </>
  ) : (
    <>
      <Tooltip title={props.currency && currencyName[props.currency]} arrow>
        <Box display="inline">{props.currency ?? ""}</Box>
      </Tooltip>{" "}
      {(props.currency && props.value?.toFixed(currencyMinorUnits[props.currency])) ?? "–"}
    </>
  );
/* c8 ignore stop */

interface CurrencyWithTooltipProps {
  /**
   * The value to format.
   */
  value: number | undefined | null;
  /**
   * The currency to use for formatting.
   */
  currency: Currency;
  /**
   * Whether to use `float: left` and `float: right` to align the currency and value to the left and right respectively.
   */
  floatAlign?: boolean;
}
