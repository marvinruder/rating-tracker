import { Box, Link } from "@mui/material";
import { dataProviderName, type Stock } from "@rating-tracker/commons";

/**
 * A component that wraps its children in a link to a given URL with certain properties. If no URL is provided, the
 * children are wrapped in a Box instead.
 * @param props The properties of the component.
 * @returns The component.
 */
const LinkToDataProvider = (props: React.PropsWithChildren<LinkToDataProviderProps>): JSX.Element => {
  return props.href ? (
    <Link
      aria-label={`Open “${props.stock.name}” on ${props.dataProvider} in a new tab.`}
      rel="noreferrer noopener" // Prevents the browser from sending the referrer
      href={props.href}
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
 * A component that wraps its children in a link to the Morningstar page of the given stock. If the stock does not have
 * a Morningstar ID, the children are wrapped in a Box instead.
 * @param props The properties of the component.
 * @returns The component.
 */
export const MorningstarNavigator = (props: React.PropsWithChildren<NavigatorProps>): JSX.Element => (
  <LinkToDataProvider
    href={
      props.stock?.morningstarID
        ? `https://tools.morningstar.it/it/stockreport/default.aspx?Site=us&id=${props.stock.morningstarID}` +
          `&LanguageId=en-US&SecurityToken=${props.stock.morningstarID}]3]0]E0WWE$$ALL`
        : ""
    }
    dataProvider={dataProviderName["morningstar"]}
    stock={props.stock}
  >
    {props.children}
  </LinkToDataProvider>
);

/**
 * A component that wraps its children in a link to the MarketScreener page of the given stock. If the stock does not
 * have a MarketScreener ID, the children are wrapped in a Box instead.
 * @param props The properties of the component.
 * @returns The component.
 */
export const MarketScreenerNavigator = (props: React.PropsWithChildren<NavigatorProps>): JSX.Element => (
  <LinkToDataProvider
    href={
      props.stock?.marketScreenerID
        ? `https://www.marketscreener.com/quote/stock/${props.stock.marketScreenerID}/consensus`
        : ""
    }
    dataProvider={dataProviderName["marketScreener"]}
    stock={props.stock}
  >
    {props.children}
  </LinkToDataProvider>
);

/**
 * A component that wraps its children in a link to the MSCI page of the given stock. If the stock does not have
 * a MSCI ID, the children are wrapped in a Box instead.
 * @param props The properties of the component.
 * @returns The component.
 */
export const MSCINavigator = (props: React.PropsWithChildren<NavigatorProps>): JSX.Element => (
  <LinkToDataProvider
    href={
      props.stock?.msciID
        ? "https://www.msci.com/our-solutions/esg-investing/esg-ratings-climate-search-tool/issuer/" +
          props.stock.msciID
        : ""
    }
    dataProvider={dataProviderName["msci"]}
    stock={props.stock}
  >
    {props.children}
  </LinkToDataProvider>
);

/**
 * A component that wraps its children in a link to the LSEG ESG Scores page and appends the stock’s name to the URL
 * using the `esg` parameter. This identifier works fine as long as LSEG writes the stock’s name in the exact same way
 * as we do. If not, LSEG still shows the input in the search field, so the user can modify it from there.
 * If the stock does not have a RIC, the children are wrapped in a Box instead.
 * @param props The properties of the component.
 * @returns The component.
 */
export const LSEGNavigator = (props: React.PropsWithChildren<NavigatorProps>): JSX.Element => (
  <LinkToDataProvider
    href={
      props.stock?.ric
        ? "https://www.lseg.com/en/data-analytics/sustainable-finance/esg-scores?esg=" +
          encodeURIComponent(props.stock?.name)
        : ""
    }
    dataProvider={dataProviderName["lseg"]}
    stock={props.stock}
  >
    {props.children}
  </LinkToDataProvider>
);

/**
 * A component that wraps its children in a link to the Standard & Poor’s page of the given stock. If the stock does not
 * have an S&P ID, the children are wrapped in a Box instead.
 * @param props The properties of the component.
 * @returns The component.
 */
export const SPNavigator = (props: React.PropsWithChildren<NavigatorProps>): JSX.Element => (
  <LinkToDataProvider
    href={props.stock?.spID ? `https://www.spglobal.com/esg/scores/results?cid=${String(props.stock.spID)}` : ""}
    dataProvider={dataProviderName["sp"]}
    stock={props.stock}
  >
    {props.children}
  </LinkToDataProvider>
);

/**
 * A component that wraps its children in a link to the Sustainalytics page of the given stock. If the stock does not
 * have a Sustainalytics ID, the children are wrapped in a Box instead.
 * @param props The properties of the component.
 * @returns The component.
 */
export const SustainalyticsNavigator = (props: React.PropsWithChildren<NavigatorProps>): JSX.Element => (
  <LinkToDataProvider
    href={
      props.stock?.sustainalyticsID ? `https://www.sustainalytics.com/esg-rating/${props.stock.sustainalyticsID}` : ""
    }
    dataProvider={dataProviderName["sustainalytics"]}
    stock={props.stock}
  >
    {props.children}
  </LinkToDataProvider>
);

/**
 * The properties of the Navigator components.
 */
interface NavigatorProps {
  /**
   * The stock containing the IDs that the navigators use.
   */
  stock: Stock;
}

/**
 * The properties of the LinkToDataProvider component.
 */
interface LinkToDataProviderProps {
  /**
   * The URL to navigate to.
   */
  href: string;
  /**
   * The stock containing the name to use in ARIA labels.
   */
  stock: Stock;
  /**
   * The name of the data provider to use in ARIA labels.
   */
  dataProvider: string;
}
