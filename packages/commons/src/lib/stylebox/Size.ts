/**
 * An array of sizes in the Morningstar Style Box.
 */
export const sizeArray = ["Small", "Mid", "Large"] as const;

/**
 * A size in the Morningstar Style Box.
 */
export type Size = (typeof sizeArray)[number];

/**
 * Checks if an entity is a valid size in the Morningstar Style Box.
 * @param entity The entity to check.
 * @returns True if the entity is a valid size in the Morningstar Style Box.
 */
export function isSize(entity: unknown): entity is Size {
  return sizeArray.includes(entity as Size);
}
