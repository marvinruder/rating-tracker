import { Country } from "./country";

export enum Region {
  NorthAmerica = "North America",
  LatinAmerica = "Latin America",
  UnitedKingdom = "United Kingdom",
  Eurozone = "Eurozone",
  EuropeDeveloped = "Europe Developed ex Euro",
  EuropeEmerging = "Europe Emerging",
  AfricaME = "Africa/Middle East",
  Japan = "Japan",
  Australasia = "Australasia",
  AsiaDeveloped = "Asia Developed",
  AsiaEmerging = "Asia Emerging",
}

const countriesInRegions = new Map<Region, Set<Country>>();

countriesInRegions.set(
  Region.NorthAmerica,
  new Set<Country>([Country.US, Country.CA, Country.PM, Country.UM])
);

countriesInRegions.set(
  Region.LatinAmerica,
  new Set<Country>([
    Country.AI,
    Country.AG,
    Country.AR,
    Country.AW,
    Country.BS,
    Country.BB,
    Country.BZ,
    Country.BM,
    Country.BO,
    Country.BQ,
    Country.BR,
    Country.VG,
    Country.KY,
    Country.CL,
    Country.CO,
    Country.CR,
    Country.CU,
    Country.CW,
    Country.DM,
    Country.DO,
    Country.EC,
    Country.SV,
    Country.FK,
    Country.GF,
    Country.GD,
    Country.GP,
    Country.GT,
    Country.GY,
    Country.HT,
    Country.HN,
    Country.JM,
    Country.MQ,
    Country.MX,
    Country.MS,
    Country.NI,
    Country.PA,
    Country.PY,
    Country.PE,
    Country.PR,
    Country.BL,
    Country.KN,
    Country.LC,
    Country.MF,
    Country.VC,
    Country.SX,
    Country.GS,
    Country.SR,
    Country.TT,
    Country.TC,
    Country.UY,
    Country.VI,
    Country.VE,
  ])
);

countriesInRegions.set(
  Region.UnitedKingdom,
  new Set<Country>([Country.GB, Country.IM])
);

countriesInRegions.set(
  Region.Eurozone,
  new Set<Country>([
    Country.AT,
    Country.AX,
    Country.BE,
    Country.CY,
    Country.EE,
    Country.FI,
    Country.FR,
    Country.DE,
    Country.GR,
    Country.IE,
    Country.IT,
    Country.LV,
    Country.LT,
    Country.LU,
    Country.MT,
    Country.NL,
    Country.PT,
    Country.SK,
    Country.SI,
    Country.ES,
  ])
);

countriesInRegions.set(
  Region.EuropeDeveloped,
  new Set<Country>([
    Country.AD,
    Country.DK,
    Country.FO,
    Country.GI,
    Country.GL,
    Country.GG,
    Country.IS,
    Country.JE,
    Country.LI,
    Country.MC,
    Country.NO,
    Country.SM,
    Country.SJ,
    Country.SE,
    Country.CH,
    Country.VA,
  ])
);

countriesInRegions.set(
  Region.EuropeEmerging,
  new Set<Country>([
    Country.AL,
    Country.BY,
    Country.BA,
    Country.BG,
    Country.HR,
    Country.CZ,
    Country.HU,
    Country.MK,
    Country.MD,
    Country.PL,
    Country.RO,
    Country.RU,
    Country.RS,
    Country.ME,
    Country.TR,
    Country.UA,
  ])
);

countriesInRegions.set(
  Region.AfricaME,
  new Set<Country>([
    Country.DZ,
    Country.AO,
    Country.BH,
    Country.BJ,
    Country.BW,
    Country.BV,
    Country.BF,
    Country.BI,
    Country.CM,
    Country.CV,
    Country.CF,
    Country.TD,
    Country.KM,
    Country.CG,
    Country.CD,
    Country.CI,
    Country.DJ,
    Country.EG,
    Country.TF,
    Country.GQ,
    Country.ER,
    Country.ET,
    Country.GA,
    Country.GM,
    Country.GH,
    Country.GN,
    Country.GW,
    Country.IR,
    Country.IQ,
    Country.IL,
    Country.JO,
    Country.KE,
    Country.KW,
    Country.LB,
    Country.LS,
    Country.LR,
    Country.LY,
    Country.MG,
    Country.MW,
    Country.ML,
    Country.MR,
    Country.MU,
    Country.YT,
    Country.MA,
    Country.MZ,
    Country.NA,
    Country.NE,
    Country.NG,
    Country.OM,
    Country.QA,
    Country.RE,
    Country.RW,
    Country.ST,
    Country.SA,
    Country.SN,
    Country.SC,
    Country.SL,
    Country.SO,
    Country.ZA,
    Country.SS,
    Country.SD,
    Country.SH,
    Country.SZ,
    Country.SY,
    Country.TZ,
    Country.TG,
    Country.TN,
    Country.UG,
    Country.AE,
    Country.PS,
    Country.EH,
    Country.YE,
    Country.ZM,
    Country.ZW,
  ])
);

countriesInRegions.set(Region.Japan, new Set<Country>([Country.JP]));

countriesInRegions.set(
  Region.Australasia,
  new Set<Country>([Country.AU, Country.NZ])
);

countriesInRegions.set(
  Region.AsiaDeveloped,
  new Set<Country>([
    Country.BN,
    Country.PF,
    Country.GU,
    Country.HK,
    Country.MO,
    Country.NC,
    Country.SG,
    Country.KR,
    Country.TW,
    Country.IO,
  ])
);

countriesInRegions.set(
  Region.AsiaEmerging,
  new Set<Country>([
    Country.AF,
    Country.AS,
    Country.AM,
    Country.AZ,
    Country.BD,
    Country.BT,
    Country.MM,
    Country.KH,
    Country.CN,
    Country.CX,
    Country.CC,
    Country.CK,
    Country.TL,
    Country.FJ,
    Country.GE,
    Country.HM,
    Country.IN,
    Country.ID,
    Country.KZ,
    Country.KI,
    Country.KG,
    Country.LA,
    Country.MY,
    Country.MV,
    Country.MH,
    Country.FM,
    Country.MN,
    Country.NR,
    Country.NP,
    Country.NU,
    Country.NF,
    Country.KP,
    Country.MP,
    Country.PK,
    Country.PW,
    Country.PG,
    Country.PH,
    Country.PN,
    Country.WS,
    Country.SB,
    Country.LK,
    Country.TJ,
    Country.TH,
    Country.TK,
    Country.TO,
    Country.TM,
    Country.TV,
    Country.UZ,
    Country.VU,
    Country.VN,
    Country.WF,
  ])
);

export const getRegionFromCountry = (country: Country) => {
  const regionsContainingCountry = new Set<Region>();
  countriesInRegions.forEach((countrySet, region) => {
    if (countrySet.has(country)) {
      regionsContainingCountry.add(region);
    }
  });
  if (regionsContainingCountry.size != 1) {
    throw new ReferenceError(
      "The country " + country + " is not in exactly one region"
    );
  }
  return regionsContainingCountry.values().next().value;
};
