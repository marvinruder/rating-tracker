import { Stock } from "./models/stock.js";

const exampleStocks: Stock[] = [
  {
    ticker: "exampleNULL",
    name: "Null Inc",
  },
  {
    ticker: "exampleAAPL",
    name: "Apple Inc",
    country: "US",
    morningstarId: "0P000000GY",
  },
  {
    ticker: "exampleTSM",
    name: "Taiwan Semiconductor Manufacturing Co Ltd",
    country: "TW",
    morningstarId: "0P000005AR",
  },
  {
    ticker: "exampleALV",
    name: "Allianz SE",
    country: "DE",
    morningstarId: "0P00009QNO",
  },
  {
    ticker: "exampleNEM",
    name: "Newmont Corp",
    country: "US",
    morningstarId: "0P000003WE",
  },
  {
    ticker: "exampleIBE",
    name: "Iberdrola SA",
    country: "ES",
    morningstarId: "0P0000A4Z3",
  },
  {
    ticker: "exampleMELI",
    name: "MercadoLibre Inc",
    country: "AR",
    morningstarId: "0P00009FL7",
  },
  {
    ticker: "exampleNOVO B",
    name: "Novo Nordisk A/S",
    country: "DK",
    morningstarId: "0P0000A5BQ",
  },
  {
    ticker: "exampleBN",
    name: "Danone SA",
    country: "FR",
    morningstarId: "0P00009WEL",
  },
  {
    ticker: "exampleORSTED",
    name: "Ørsted A/S",
    country: "DK",
    morningstarId: "0P0001846T",
  },
  {
    ticker: "exampleKGX",
    name: "Kion Group AG",
    country: "DE",
    morningstarId: "0P0000Z3A6",
  },
];

export default exampleStocks;
