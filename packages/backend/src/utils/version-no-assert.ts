import packageInfo from "../../package.json";

/**
 * The version number of the project. It is imported from `package.json` without an import assertion, which is
 * currently not supported in Vitest.
 */
export const version = packageInfo.version;
