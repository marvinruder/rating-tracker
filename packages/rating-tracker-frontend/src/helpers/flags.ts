const alphaToFlagAlpha = (a: string) =>
  String.fromCodePoint(0x1f1a5 + a.toUpperCase().codePointAt(0)!);
export const emojiFlag = (countryCode: string) =>
  countryCode.slice(0, 2).split("").map(alphaToFlagAlpha).join("");
