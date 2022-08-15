import { Card } from "@mui/material";
import { Country } from "src/enums/regions/country";
import { Industry } from "src/enums/sectors/industry";
import { Stock } from "src/models/stock";
import StocksTable from "./StocksTable";

function AllStocks() {
  const allStocks: Stock[] = [
    {
      ticker: "AAPL",
      name: "Apple Inc.",
      country: Country.US,
      industry: Industry.ConsumerElectronics,
    },
    {
      ticker: "TSM",
      name: "Taiwan Semiconductor Manufacturing Co., Ltd.",
      country: Country.TW,
      industry: Industry.Semiconductors,
    },
    {
      ticker: "ALIZF",
      name: "Allianz SE",
      country: Country.DE,
      industry: Industry.InsuranceDiversified,
    },
    {
      ticker: "NEM",
      name: "Newmont Corporation",
      country: Country.US,
      industry: Industry.Gold,
    },
    {
      ticker: "IBDSF",
      name: "Iberdrola, S.A.",
      country: Country.ES,
      industry: Industry.UtilitiesDiversified,
    },
    {
      ticker: "MELI",
      name: "MercadoLibre Inc.",
      country: Country.AR,
      industry: Industry.InternetRetail,
    },
    {
      ticker: "NONOF",
      name: "Novo Nordisk A/S",
      country: Country.DK,
      industry: Industry.Biotechnology,
    },
    {
      ticker: "GPDNF",
      name: "Danone SA",
      country: Country.FR,
      industry: Industry.PackagedFoods,
    },
    {
      ticker: "DOGEF",
      name: "Ørsted A/S",
      country: Country.DK,
      industry: Industry.UtilitiesRenewable,
    },
    {
      ticker: "KNNGF",
      name: "Kion Group AG",
      country: Country.DE,
      industry: Industry.FarmHeavyConstructionMachinery,
    },
  ];

  return (
    <Card>
      <StocksTable stocks={allStocks} />
    </Card>
  );
}

export default AllStocks;
