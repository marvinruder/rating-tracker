import { Country } from "./enums/country";
import { Industry } from "./enums/industry";
import { Size } from "./enums/size";
import { Style } from "./enums/style";
import { Stock } from "./models/stock";

const exampleStocks: Stock[] = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    country: Country.US,
    industry: Industry.ConsumerElectronics,
    size: Size.Large,
    style: Style.Growth,
  },
  {
    ticker: "TSM",
    name: "Taiwan Semiconductor Manufacturing Co., Ltd.",
    country: Country.TW,
    industry: Industry.Semiconductors,
    size: Size.Large,
    style: Style.Blend,
  },
  {
    ticker: "ALIZF",
    name: "Allianz SE",
    country: Country.DE,
    industry: Industry.InsuranceDiversified,
    size: Size.Large,
    style: Style.Value,
  },
  {
    ticker: "NEM",
    name: "Newmont Corporation",
    country: Country.US,
    industry: Industry.Gold,
    size: Size.Mid,
    style: Style.Value,
  },
  {
    ticker: "IBDSF",
    name: "Iberdrola, S.A.",
    country: Country.ES,
    industry: Industry.UtilitiesDiversified,
    size: Size.Large,
    style: Style.Blend,
  },
  {
    ticker: "MELI",
    name: "MercadoLibre Inc.",
    country: Country.AR,
    industry: Industry.InternetRetail,
    size: Size.Large,
    style: Style.Growth,
  },
  {
    ticker: "NONOF",
    name: "Novo Nordisk A/S",
    country: Country.DK,
    industry: Industry.Biotechnology,
    size: Size.Large,
    style: Style.Growth,
  },
  {
    ticker: "GPDNF",
    name: "Danone SA",
    country: Country.FR,
    industry: Industry.PackagedFoods,
    size: Size.Large,
    style: Style.Blend,
  },
  {
    ticker: "DOGEF",
    name: "Ørsted A/S",
    country: Country.DK,
    industry: Industry.UtilitiesRenewable,
    size: Size.Large,
    style: Style.Blend,
  },
  {
    ticker: "KNNGF",
    name: "Kion Group AG",
    country: Country.DE,
    industry: Industry.FarmHeavyConstructionMachinery,
    size: Size.Mid,
    style: Style.Blend,
  },
];

export default exampleStocks;
