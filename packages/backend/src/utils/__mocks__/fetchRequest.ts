import type { FetchResponse } from "@rating-tracker/commons";
import { FetchError, handleResponse } from "@rating-tracker/commons";

/**
 * A mock of the `fetch` API wrapper. Returns predefined responses or a 501 Not Implemented error for any other request.
 * @param url The URL of the request.
 * @returns A {@link Promise} that resolves to the response of the request.
 * @throws a {@link FetchError} if the response status code is not in the 2XX range.
 */
export const performFetchRequest = async (url: string): Promise<FetchResponse> => {
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
