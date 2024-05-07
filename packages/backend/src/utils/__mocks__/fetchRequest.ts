import type { FetchRequestWithBodyOptions, FetchResponse } from "@rating-tracker/commons";
import { FetchError, handleResponse } from "@rating-tracker/commons";

/**
 * A mock of the `fetch` API wrapper. Returns predefined responses or a 501 Not Implemented error for any other request.
 * @param url The URL of the request.
 * @param config The configuration options of the request.
 * @returns A {@link Promise} that resolves to the response of the request.
 * @throws a {@link FetchError} if the response status code is not in the 2XX range.
 */
export const performFetchRequest = async (
  url: string,
  config?: FetchRequestWithBodyOptions,
): Promise<FetchResponse> => {
  if (url === "https://query1.finance.yahoo.com/v1/finance/search")
    return handleResponse(
      new Response(
        config?.params?.q === "app"
          ? // eslint-disable-next-line max-len
            '{"explains":[],"count":8,"quotes":[{"exchange":"NMS","shortname":"Applovin Corporation","quoteType":"EQUITY","symbol":"APP","index":"quotes","score":2011000.0,"typeDisp":"Equity","longname":"AppLovin Corporation","exchDisp":"NASDAQ","sector":"Technology","sectorDisp":"Technology","industry":"Software—Application","industryDisp":"Software—Application","dispSecIndFlag":false,"isYahooFinance":true},{"exchange":"NMS","shortname":"Apple Inc.","quoteType":"EQUITY","symbol":"AAPL","index":"quotes","score":33505.0,"typeDisp":"Equity","longname":"Apple Inc.","exchDisp":"NASDAQ","sector":"Technology","sectorDisp":"Technology","industry":"Consumer Electronics","industryDisp":"Consumer Electronics","logoUrl":"https://s.yimg.com/lb/brands/150x150_apple.png","isYahooFinance":true},{"exchange":"NMS","shortname":"Applied Materials, Inc.","quoteType":"EQUITY","symbol":"AMAT","index":"quotes","score":20414.0,"typeDisp":"Equity","longname":"Applied Materials, Inc.","exchDisp":"NASDAQ","sector":"Technology","sectorDisp":"Technology","industry":"Semiconductor Equipment & Materials","industryDisp":"Semiconductor Equipment & Materials","isYahooFinance":true},{"exchange":"NCM","shortname":"Digital Turbine, Inc.","quoteType":"EQUITY","symbol":"APPS","index":"quotes","score":20108.0,"typeDisp":"Equity","longname":"Digital Turbine, Inc.","exchDisp":"NASDAQ","sector":"Technology","sectorDisp":"Technology","industry":"Software—Application","industryDisp":"Software—Application","isYahooFinance":true},{"exchange":"PCX","shortname":"Vanguard Div Appreciation ETF","quoteType":"ETF","symbol":"VIG","index":"quotes","score":20099.0,"typeDisp":"ETF","longname":"Vanguard Dividend Appreciation Index Fund ETF Shares","exchDisp":"NYSEArca","isYahooFinance":true},{"exchange":"NGM","shortname":"Applied Optoelectronics, Inc.","quoteType":"EQUITY","symbol":"AAOI","index":"quotes","score":20074.0,"typeDisp":"Equity","longname":"Applied Optoelectronics, Inc.","exchDisp":"NASDAQ","sector":"Technology","sectorDisp":"Technology","industry":"Communication Equipment","industryDisp":"Communication Equipment","isYahooFinance":true},{"exchange":"NYQ","shortname":"Apple Hospitality REIT, Inc.","quoteType":"EQUITY","symbol":"APLE","index":"quotes","score":20051.0,"typeDisp":"Equity","longname":"Apple Hospitality REIT, Inc.","exchDisp":"NYSE","sector":"Real Estate","sectorDisp":"Real Estate","industry":"REIT—Hotel & Motel","industryDisp":"REIT—Hotel & Motel","isYahooFinance":true}],"news":[],"nav":[{"navName":"Apparel Retail","navUrl":"https://finance.yahoo.com/sectors/consumer-cyclical/apparel-retail"}],"lists":[],"researchReports":[],"screenerFieldResults":[],"totalTime":49,"timeTakenForQuotes":439,"timeTakenForNews":0,"timeTakenForAlgowatchlist":400,"timeTakenForPredefinedScreener":400,"timeTakenForCrunchbase":0,"timeTakenForNav":400,"timeTakenForResearchReports":0,"timeTakenForScreenerField":0,"timeTakenForCulturalAssets":0}'
          : // eslint-disable-next-line max-len
            '{"explains":[],"count":0,"quotes":[],"news":[],"nav":[],"lists":[],"researchReports":[],"screenerFieldResults":[],"totalTime":22,"timeTakenForQuotes":414,"timeTakenForNews":0,"timeTakenForAlgowatchlist":400,"timeTakenForPredefinedScreener":400,"timeTakenForCrunchbase":0,"timeTakenForNav":400,"timeTakenForResearchReports":0,"timeTakenForScreenerField":0,"timeTakenForCulturalAssets":0}',
        { headers: new Headers({ "Content-Type": "application/json" }) },
      ),
    );
  if (url === "https://s.yimg.com/lb/brands/150x150_apple.png")
    return Object.defineProperty(
      await handleResponse(
        new Response(Buffer.from("AVeryFancyStockLogo=", "base64"), {
          headers: new Headers({ "Content-Type": "image/png" }),
        }),
      ),
      "url",
      { value: url },
    );

  if (url === "http://nonexisting.signal.api.host/v1/accounts")
    return handleResponse(new Response(JSON.stringify([]), {}));
  if (url.match(/https:\/\/assets\.traderepublic\.com\/img\/logos\/[A-Z0-9]+\/light\.svg/))
    return [
      "DE0008404005",
      "US0378331005",
      "FR0000120644",
      "ES0144580Y14",
      "DE000KGX8881",
      "US58733R1023",
      "US6516391066",
      "DK0060534915",
      "DK0060094928",
      "US8740391003",
    ].some((isin) => url.includes(isin))
      ? handleResponse(
          new Response(
            // eslint-disable-next-line max-len
            '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">\n<circle cx="20" cy="20" r="15" fill="#2971D6"/>\n</svg>',
            {
              status: 200,
              statusText: "OK",
              headers: new Headers({
                "Content-Type": "image/svg+xml",
                Age: "23596",
                ...(url.includes("US8740391003") ? { "Cache-Control": "public, max-age=86400" } : {}),
              }),
            },
          ),
        )
      : handleResponse(
          new Response(
            // eslint-disable-next-line max-len
            '<?xml version="1.0" encoding="UTF-8"?>\n<Error>\n    <Code>AccessDenied</Code>\n    <Message>Access Denied</Message>\n    <RequestId>FPAY3ZDZQYATP30X</RequestId>\n    <HostId>5qkCHGJm6K910YQHB5GmQvBnVaol3zWiGYJWz1XRampZhP2UZCJ1VnW9Il9x2olchFLLUAdv+1Q=</HostId>\n</Error>\n',
            { status: 403, statusText: "Forbidden", headers: new Headers({ "Content-Type": "application/xml" }) },
          ),
        );
  // console.error(`A fetch request for the URL ${url} has not been mocked yet.`);
  throw new FetchError(
    await handleResponse(
      new Response(null, {
        status: 501,
        statusText: `A fetch request for the URL ${url} has not been mocked yet.`,
      }),
    ),
  );
};
