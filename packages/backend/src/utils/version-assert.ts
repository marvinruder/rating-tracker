import packageInfo from "../../package.json" assert { type: "json" };

/**
 * The version number of the project. It is imported from `package.json` with an import assertion, which is required
 * by Node.
 */
export const version = packageInfo.version;
