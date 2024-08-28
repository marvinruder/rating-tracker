/**
 * An array of styles in the Morningstar Style Box.
 */
export const styleArray = ["Value", "Blend", "Growth"] as const;

/**
 * A style in the Morningstar Style Box.
 */
export type Style = (typeof styleArray)[number];

/**
 * Checks if an entity is a valid style in the Morningstar Style Box.
 * @param entity The entity to check.
 * @returns True if the entity is a valid style in the Morningstar Style Box.
 */
export function isStyle(entity: unknown): entity is Style {
  return styleArray.includes(entity as Style);
}
