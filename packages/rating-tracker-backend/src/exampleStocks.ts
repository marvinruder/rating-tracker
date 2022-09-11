import { Country } from "./enums/country.js";
import { Industry } from "./enums/industry.js";
import { Size } from "./enums/size.js";
import { Style } from "./enums/style.js";
import { Stock } from "./models/stock.js";

const exampleStocks: Stock[] = [
  {
    ticker: "exampleAAPL",
    name: "Apple Inc.",
    country: Country.US,
    industry: Industry.ConsumerElectronics,
    size: Size.Large,
    style: Style.Growth,
  },
  {
    ticker: "exampleTSM",
    name: "Taiwan Semiconductor Manufacturing Co., Ltd.",
    country: Country.TW,
    industry: Industry.Semiconductors,
    size: Size.Large,
    style: Style.Blend,
  },
  {
    ticker: "exampleALIZF",
    name: "Allianz SE",
    country: Country.DE,
    industry: Industry.InsuranceDiversified,
    size: Size.Large,
    style: Style.Value,
  },
  {
    ticker: "exampleNEM",
    name: "Newmont Corporation",
    country: Country.US,
    industry: Industry.Gold,
    size: Size.Mid,
    style: Style.Value,
  },
  {
    ticker: "exampleIBDSF",
    name: "Iberdrola, S.A.",
    country: Country.ES,
    industry: Industry.UtilitiesDiversified,
    size: Size.Large,
    style: Style.Blend,
  },
  {
    ticker: "exampleMELI",
    name: "MercadoLibre Inc.",
    country: Country.AR,
    industry: Industry.InternetRetail,
    size: Size.Large,
    style: Style.Growth,
  },
  {
    ticker: "exampleNONOF",
    name: "Novo Nordisk A/S",
    country: Country.DK,
    industry: Industry.Biotechnology,
    size: Size.Large,
    style: Style.Growth,
  },
  {
    ticker: "exampleGPDNF",
    name: "Danone SA",
    country: Country.FR,
    industry: Industry.PackagedFoods,
    size: Size.Large,
    style: Style.Blend,
  },
  {
    ticker: "exampleDOGEF",
    name: "Ørsted A/S",
    country: Country.DK,
    industry: Industry.UtilitiesRenewable,
    size: Size.Large,
    style: Style.Blend,
  },
  {
    ticker: "exampleKNNGF",
    name: "Kion Group AG",
    country: Country.DE,
    industry: Industry.FarmHeavyConstructionMachinery,
    size: Size.Mid,
    style: Style.Blend,
  },
];

export default exampleStocks;
