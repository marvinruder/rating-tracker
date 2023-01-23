export const styleArray = ["Value", "Blend", "Growth"] as const;

export type Style = (typeof styleArray)[number];

export function isStyle(s: string): s is Style {
  return styleArray.includes(s as Style);
}
