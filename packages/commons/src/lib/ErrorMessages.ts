/**
 * An error message when fetching from Standard & Poor’s fails because we attempted to fetch a stock that is only
 * available for S&P Premium subscribers, which we, sadly, are not :(
 */
export const SP_PREMIUM_STOCK_ERROR_MESSAGE = "This stock’s ESG Score is available for S&P Premium subscribers only.";

/**
 * An error message when an unauthenticated user attempts to access a protected endpoint.
 */
export const UNAUTHORIZED_ERROR_MESSAGE = "This endpoint is available to authenticated clients only. Please sign in.";

/**
 * An error message when an authenticated user attempts to access a protected endpoint without the necessary access
 * rights.
 */
export const FORBIDDEN_ERROR_MESSAGE =
  "The authenticated user account does not have the rights necessary to access this endpoint.";

/**
 * An error message when a user attempts to register a new account with an email address that is already registered.
 */
export const ALREADY_REGISTERED_ERROR_MESSAGE = "This email address is already registered. Please sign in.";
