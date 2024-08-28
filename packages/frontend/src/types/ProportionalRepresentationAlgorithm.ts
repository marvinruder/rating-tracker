/**
 * An array of algorithms to use for proportional representation.
 */
export const proportionalRepresentationAlgorithmArray = ["sainteLague", "hareNiemeyer"] as const;

/**
 * An algorithm to use for proportional representation.
 */
export type ProportionalRepresentationAlgorithm = "sainteLague" | "hareNiemeyer";

/**
 * Checks if an entity is a valid algorithm to use for proportional representation.
 * @param entity The entity to check.
 * @returns True if the entity is a valid algorithm to use for proportional representation.
 */
export function isProportionalRepresentationAlgorithm(entity: unknown): entity is ProportionalRepresentationAlgorithm {
  return proportionalRepresentationAlgorithmArray.includes(entity as ProportionalRepresentationAlgorithm);
}
