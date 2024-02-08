/**
 * An array of styles in the Morningstar Style Box.
 */
export const styleArray = ["Value", "Blend", "Growth"] as const;

/**
 * A style in the Morningstar Style Box.
 */
export type Style = (typeof styleArray)[number];

/**
 * Checks if a string is a valid style in the Morningstar Style Box.
 * @param s The string to check.
 * @returns True if the string is a valid style in the Morningstar Style Box.
 */
export function isStyle(s: string): s is Style {
  return styleArray.includes(s as Style);
}
