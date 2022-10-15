import { Country } from "./enums/country.js";
import { Stock } from "./models/stock.js";

const exampleStocks: Stock[] = [
  {
    ticker: "exampleNULL",
    name: "Null Inc",
  },
  {
    ticker: "exampleAAPL",
    name: "Apple Inc",
    country: Country.US,
    morningstarId: "0P000000GY",
  },
  {
    ticker: "exampleTSM",
    name: "Taiwan Semiconductor Manufacturing Co Ltd",
    country: Country.TW,
    morningstarId: "0P000005AR",
  },
  {
    ticker: "exampleALV",
    name: "Allianz SE",
    country: Country.DE,
    morningstarId: "0P00009QNO",
  },
  {
    ticker: "exampleNEM",
    name: "Newmont Corp",
    country: Country.US,
    morningstarId: "0P000003WE",
  },
  {
    ticker: "exampleIBE",
    name: "Iberdrola SA",
    country: Country.ES,
    morningstarId: "0P0000A4Z3",
  },
  {
    ticker: "exampleMELI",
    name: "MercadoLibre Inc",
    country: Country.AR,
    morningstarId: "0P00009FL7",
  },
  {
    ticker: "exampleNOVO B",
    name: "Novo Nordisk A/S",
    country: Country.DK,
    morningstarId: "0P0000A5BQ",
  },
  {
    ticker: "exampleBN",
    name: "Danone SA",
    country: Country.FR,
    morningstarId: "0P00009WEL",
  },
  {
    ticker: "exampleORSTED",
    name: "Ørsted A/S",
    country: Country.DK,
    morningstarId: "0P0001846T",
  },
  {
    ticker: "exampleKGX",
    name: "Kion Group AG",
    country: Country.DE,
    morningstarId: "0P0000Z3A6",
  },
];

export default exampleStocks;
