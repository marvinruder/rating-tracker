import { Card, Container } from "@mui/material";
import { Stock, favoriteListEndpointPath, stockEndpointPath } from "@rating-tracker/commons";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { Footer, PageHeaderWrapper } from "../../../components/etc/HeaderFooter";
import { StockDetails } from "../../../components/etc/StockDetails";
import { useNotification } from "../../../contexts/NotificationContext";
import { baseUrl } from "../../../router";

import { StockHeader } from "./StockHeader";

/**
 * A module that displays the details of a stock.
 *
 * @returns {JSX.Element} The component.
 */
const StockModule = (): JSX.Element => {
  const [stock, setStock] = useState<Stock>();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const { setErrorNotificationOrClearSession: setErrorNotification } = useNotification();

  /**
   * Fetches the stock with the given ticker.
   *
   * @param {string} ticker The ticker of the stock to fetch.
   */
  const getStock = (ticker: string) => {
    axios
      .get(baseUrl + stockEndpointPath + `/${ticker}`)
      .then((res) => setStock(res.data))
      .catch((e) => setErrorNotification(e, "fetching stock"));
    axios
      .get(baseUrl + favoriteListEndpointPath)
      .then((res) => setIsFavorite((res.data.stocks as Stock[]).find((stock) => ticker === stock.ticker) !== undefined))
      .catch((e) => setErrorNotification(e, "fetching favorites"));
  };

  const { ticker } = useParams();

  useEffect(() => {
    getStock(ticker);
  }, [ticker]);

  return (
    <>
      <PageHeaderWrapper maxWidth={false}>
        <StockHeader stock={stock} getStock={() => getStock(ticker)} isFavorite={isFavorite} />
      </PageHeaderWrapper>
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
