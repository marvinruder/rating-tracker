export const sizeArray = ["Small", "Mid", "Large"] as const;

export type Size = (typeof sizeArray)[number];

export function isSize(s: string): s is Size {
  return sizeArray.includes(s as Size);
}
