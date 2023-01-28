/**
 * An array of sizes in the Morningstar Style Box.
 */
export const sizeArray = ["Small", "Mid", "Large"] as const;

/**
 * A size in the Morningstar Style Box.
 */
export type Size = (typeof sizeArray)[number];

/**
 * Checks if a string is a valid size in the Morningstar Style Box.
 *
 * @param {string} s The string to check.
 * @returns {boolean} True if the string is a valid size in the Morningstar Style Box.
 */
export function isSize(s: string): s is Size {
  return sizeArray.includes(s as Size);
}
