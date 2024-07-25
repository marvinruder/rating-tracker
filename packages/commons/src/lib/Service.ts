/**
 * An array of services Rating Tracker depends on.
 */
export const serviceArray = ["PostgreSQL", "Signal"] as const;

/**
 * A service Rating Tracker depends on.
 */
export type Service = (typeof serviceArray)[number];

/**
 * Checks if a string is a valid service Rating Tracker depends on.
 * @param s The string to check.
 * @returns True if the string is a valid service Rating Tracker depends on.
 */
export function isService(s: string): s is Service {
  return serviceArray.includes(s as Service);
}
