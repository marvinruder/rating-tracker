import type { ServerFeature } from "@rating-tracker/commons";

/**
 * Parses the `features` cookie, if set, and returns the supported server features.
 */
export const getFeaturesFromCookie = (): ServerFeature[] =>
  (document.cookie
    .split("; ")
    .find((c) => c.startsWith("features="))
    ?.split("=")[1]
    ?.split("~") as ServerFeature[]) ?? [];

/**
 * Checks whether a given feature is supported by the server.
 * @param feature The feature to check.
 * @returns Whether the feature is supported by the server.
 */
export const isSupportedByServer = (feature: ServerFeature): boolean => getFeaturesFromCookie().includes(feature);
