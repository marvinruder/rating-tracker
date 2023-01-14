import { Box, Link } from "@mui/material";
import { Stock } from "rating-tracker-commons";

const MorningstarNavigator = (props: {
  stock: Stock;
  children: React.ReactNode;
}) => {
  return props.stock?.morningstarId ? (
    <Link
      rel="noreferrer noopener"
      href={`https://tools.morningstar.co.uk/uk/stockreport/default.aspx?Site=us&id=${props.stock.morningstarId}&LanguageId=en-US&SecurityToken=${props.stock.morningstarId}]3]0]E0WWE$$ALL`}
      target="_blank"
      style={{ color: "inherit", textDecoration: "none" }}
    >
      {props.children}
    </Link>
  ) : (
    <Box>{props.children}</Box>
  );
};

const MarketScreenerNavigator = (props: {
  stock: Stock;
  children: React.ReactNode;
}) => {
  return props.stock?.marketScreenerId ? (
    <Link
      rel="noreferrer noopener"
      href={`https://www.marketscreener.com/quote/stock/${props.stock.marketScreenerId}/`}
      target="_blank"
      style={{ color: "inherit", textDecoration: "none" }}
    >
      {props.children}
    </Link>
  ) : (
    <Box>{props.children}</Box>
  );
};

const MSCINavigator = (props: { stock: Stock; children: React.ReactNode }) => {
  return props.stock?.msciId ? (
    <Link
      rel="noreferrer noopener"
      href={`https://www.msci.com/our-solutions/esg-investing/esg-ratings-climate-search-tool/issuer/${props.stock.msciId}`}
      target="_blank"
      style={{ color: "inherit", textDecoration: "none" }}
    >
      {props.children}
    </Link>
  ) : (
    <Box>{props.children}</Box>
  );
};

const RefinitivNavigator = (props: {
  stock: Stock;
  children: React.ReactNode;
}) => {
  return props.stock?.ric ? (
    <Link
      onClick={() => navigator.clipboard.writeText(props.stock.name)}
      rel="noreferrer noopener"
      href={`https://www.refinitiv.com/en/sustainable-finance/esg-scores`}
      target="_blank"
      style={{ color: "inherit", textDecoration: "none" }}
    >
      {props.children}
    </Link>
  ) : (
    <Box>{props.children}</Box>
  );
};

const SPNavigator = (props: { stock: Stock; children: React.ReactNode }) => {
  return props.stock?.spId ? (
    <Link
      rel="noreferrer noopener"
      href={`https://www.spglobal.com/esg/scores/results?cid=${String(
        props.stock.spId
      )}`}
      target="_blank"
      style={{ color: "inherit", textDecoration: "none" }}
    >
      {props.children}
    </Link>
  ) : (
    <Box>{props.children}</Box>
  );
};

const SustainalyticsNavigator = (props: {
  stock: Stock;
  children: React.ReactNode;
}) => {
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

export {
  MorningstarNavigator,
  MarketScreenerNavigator,
  MSCINavigator,
  RefinitivNavigator,
  SPNavigator,
  SustainalyticsNavigator,
};
