import { Card, Container, useTheme } from "@mui/material";
import type { Stock } from "@rating-tracker/commons";
import { baseURL, stockLogoEndpointSuffix, stocksEndpointPath } from "@rating-tracker/commons";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { Footer } from "../../../components/etc/Footer";
import { HeaderWrapper } from "../../../components/etc/HeaderWrapper";
import { StockDetails } from "../../../components/stock/layouts/StockDetails";
import { useFavoritesContextState } from "../../../contexts/FavoritesContext";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

import { StockHeader } from "./StockHeader";

/**
 * A module that displays the details of a stock.
 * @returns The component.
 */
const StockModule = (): JSX.Element => {
  const [stock, setStock] = useState<Stock>();

  const { favorites } = useFavoritesContextState();
  const isFavorite = favorites?.includes(stock?.ticker);

  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  const theme = useTheme();

  /**
   * Fetches the stock with the given ticker.
   * @param ticker The ticker of the stock to fetch.
   * @returns A {@link Promise} that resolves when the stock has been fetched and set.
   */
  const getStock = (ticker: string): Promise<void> =>
    api
      .get(stocksEndpointPath + `/${ticker}`)
      .then((res) => setStock(res.data))
      .catch((e) => setErrorNotificationOrClearSession(e, "fetching stock"));

  const { ticker } = useParams();

  useEffect(() => void getStock(ticker), [ticker]);

  // Preload the stock logo
  const stockLogo = new Image();
  stockLogo.src = `${baseURL}${stocksEndpointPath}/${ticker}${stockLogoEndpointSuffix}?dark=${
    theme.palette.mode === "dark"
  }`;

  return (
    <>
      <HeaderWrapper maxWidth={false}>
        <StockHeader stock={stock} getStock={() => getStock(ticker)} isFavorite={isFavorite} />
      </HeaderWrapper>
      <Container maxWidth={false}>
        <Card sx={{ m: "auto", maxWidth: "lg" }}>
          <StockDetails stock={stock} />
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default StockModule;
