import { Box, Link } from "@mui/material";
import { Stock } from "rating-tracker-commons";

/**
 * A component that wraps its children in a link to the Morningstar page of the given stock. If the stock does not have
 * a Morningstar ID, the children are wrapped in a Box instead.
 *
 * @param {NavigatorProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const MorningstarNavigator = (props: NavigatorProps): JSX.Element => {
  return props.stock?.morningstarId ? (
    <Link
      rel="noreferrer noopener" // Prevents the browser from sending the referrer
      href={
        `https://tools.morningstar.co.uk/uk/stockreport/default.aspx?Site=us&id=${props.stock.morningstarId}` +
        `&LanguageId=en-US&SecurityToken=${props.stock.morningstarId}]3]0]E0WWE$$ALL`
      }
      target="_blank" // Open in new tab
      style={{ color: "inherit", textDecoration: "none" }} // No change in color, no underline
    >
      {props.children}
    </Link>
  ) : (
    <Box>{props.children}</Box>
  );
};

/**
 * A component that wraps its children in a link to the MarketScreener page of the given stock. If the stock does not
 * have a MarketScreener ID, the children are wrapped in a Box instead.
 *
 * @param {NavigatorProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const MarketScreenerNavigator = (props: NavigatorProps): JSX.Element => {
  return props.stock?.marketScreenerId ? (
    <Link
      rel="noreferrer noopener" // Prevents the browser from sending the referrer
      href={`https://www.marketscreener.com/quote/stock/${props.stock.marketScreenerId}/`}
      target="_blank" // Open in new tab
      style={{ color: "inherit", textDecoration: "none" }} // No change in color, no underline
    >
      {props.children}
    </Link>
  ) : (
    <Box>{props.children}</Box>
  );
};

/**
 * A component that wraps its children in a link to the MSCI page of the given stock. If the stock does not have
 * a MSCI ID, the children are wrapped in a Box instead.
 *
 * @param {NavigatorProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const MSCINavigator = (props: NavigatorProps): JSX.Element => {
  return props.stock?.msciId ? (
    <Link
      rel="noreferrer noopener" // Prevents the browser from sending the referrer
      href={
        `https://www.msci.com/our-solutions/esg-investing/esg-ratings-climate-search-tool/issuer/` +
        `${props.stock.msciId}`
      }
      target="_blank" // Open in new tab
      style={{ color: "inherit", textDecoration: "none" }} // No change in color, no underline
    >
      {props.children}
    </Link>
  ) : (
    <Box>{props.children}</Box>
  );
};

/**
 * A component that wraps its children in a link to the Refinitiv ESG company scores page and copies the stock’s name
 * to the clipboard. If the stock does not have a RIC, the children are wrapped in a Box instead.
 *
 * @param {NavigatorProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const RefinitivNavigator = (props: NavigatorProps): JSX.Element => {
  return props.stock?.ric ? (
    <Link
      onClick={() => navigator.clipboard.writeText(props.stock.name)} // Copy the stock name to the clipboard
      rel="noreferrer noopener" // Prevents the browser from sending the referrer
      href={`https://www.refinitiv.com/en/sustainable-finance/esg-scores`}
      target="_blank" // Open in new tab
      style={{ color: "inherit", textDecoration: "none" }} // No change in color, no underline
    >
      {props.children}
    </Link>
  ) : (
    <Box>{props.children}</Box>
  );
};

/**
 * A component that wraps its children in a link to the Standard & Poor’s page of the given stock. If the stock does not
 * have an S&P ID, the children are wrapped in a Box instead.
 *
 * @param {NavigatorProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const SPNavigator = (props: NavigatorProps): JSX.Element => {
  return props.stock?.spId ? (
    <Link
      rel="noreferrer noopener" // Prevents the browser from sending the referrer
      href={`https://www.spglobal.com/esg/scores/results?cid=${String(
        props.stock.spId
      )}`}
      target="_blank" // Open in new tab
      style={{ color: "inherit", textDecoration: "none" }} // No change in color, no underline
    >
      {props.children}
    </Link>
  ) : (
    <Box>{props.children}</Box>
  );
};

/**
 * A component that wraps its children in a link to the Sustainalytics page of the given stock. If the stock does not
 * have a Sustainalytics ID, the children are wrapped in a Box instead.
 *
 * @param {NavigatorProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const SustainalyticsNavigator = (props: NavigatorProps): JSX.Element => {
  return props.stock?.sustainalyticsId ? (
    <Link
      rel="noreferrer noopener"
      href={`https://www.sustainalytics.com/esg-rating/${props.stock.sustainalyticsId}`}
      target="_blank"
      color="inherit"
      underline="none"
    >
      {props.children}
    </Link>
  ) : (
    <Box>{props.children}</Box>
  );
};

/**
 * The properties of the Navigator components.
 */
interface NavigatorProps {
  /**
   * The stock containing the IDs that the navigators use.
   */
  stock: Stock;
  /**
   * The children of the component.
   */
  children: React.ReactNode;
}

export {
  MorningstarNavigator,
  MarketScreenerNavigator,
  MSCINavigator,
  RefinitivNavigator,
  SPNavigator,
  SustainalyticsNavigator,
};
