/**
 * An array of algorithms to use for proportional representation.
 */
export const proportionalRepresentationAlgorithmArray = ["sainteLague", "hareNiemeyer"] as const;

/**
 * An algorithm to use for proportional representation.
 */
export type ProportionalRepresentationAlgorithm = "sainteLague" | "hareNiemeyer";

/**
 * Checks if a string is a valid algorithm to use for proportional representation.
 * @param s The string to check.
 * @returns True if the string is a valid algorithm to use for proportional representation.
 */
export function isProportionalRepresentationAlgorithm(s: string): s is ProportionalRepresentationAlgorithm {
  return proportionalRepresentationAlgorithmArray.includes(s as ProportionalRepresentationAlgorithm);
}
