/**
 * An array of services Rating Tracker depends on.
 */
export const serviceArray = ["PostgreSQL", "OpenID Connect", "Email", "Signal"] as const;

/**
 * A service Rating Tracker depends on.
 */
export type Service = (typeof serviceArray)[number];

/**
 * Checks if an entity is a valid service Rating Tracker depends on.
 * @param entity The entity to check.
 * @returns True if the entity is a valid service Rating Tracker depends on.
 */
export function isService(entity: unknown): entity is Service {
  return serviceArray.includes(entity as Service);
}
