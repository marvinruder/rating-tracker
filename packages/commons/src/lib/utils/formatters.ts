/**
 * Returns the letter `s` if the number is not 1, otherwise an empty string.
 * @param number The number to check.
 * @returns The pluralization suffix.
 */
export const pluralize = (number: number): string => (Math.abs(number) !== 1 ? "s" : "");
