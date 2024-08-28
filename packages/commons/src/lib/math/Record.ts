/**
 * A collection of mathematical functions for working with Records.
 */
export class RecordMath {
  /**
   * Sums the values of a record.
   * @param record The record to sum.
   * @returns The sum of the values.
   */
  static sum = (record: Record<string | number | symbol, number>): number =>
    Object.values(record).reduce((a, b) => a + b, 0);

  /**
   * Calculates the mean of a record.
   * @param record The record to calculate the mean of.
   * @returns The mean of the record.
   */
  static mean = <K extends string | number | symbol>(record: Record<K, number>): K =>
    (Object.keys(record) as (keyof typeof record)[]).flatMap((key) => Array(record[key]).fill(key))[
      Math.floor(RecordMath.sum(record) / 2)
    ];
}
