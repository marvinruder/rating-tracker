import { Card, Container, useMediaQuery } from "@mui/material";
import axios from "axios";
import { baseUrl } from "../../../router";
import { Stock, favoriteListEndpointPath, stockEndpointPath } from "@rating-tracker/commons";
import { useEffect, useState } from "react";
import { Footer, PageHeaderWrapper } from "../../../components/etc/HeaderFooter";
import { StockHeader } from "./StockHeader";
import { useNotification } from "../../../contexts/NotificationContext";
import { useParams } from "react-router";
import { StockDetails } from "../../../components/etc/StockDetails";

/**
 * A module that displays the details of a stock.
 *
 * @returns {JSX.Element} The component.
 */
const StockModule = (): JSX.Element => {
  const [stock, setStock] = useState<Stock>();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const { setErrorNotification } = useNotification();

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

  /**
   * Possible widths of the details card.
   */
  let detailsCardWidth: 900 | 600 | 300;

  switch (+useMediaQuery("(min-width:964px)") + +useMediaQuery("(min-width:664px)")) {
    case 2:
      // The screen is at least 964px wide.
      detailsCardWidth = 900;
      break;
    case 1:
      // The screen is at least 664px, but less than 964px wide.
      detailsCardWidth = 600;
      break;
    case 0:
      // The screen is less than 664px wide.
      detailsCardWidth = 300;
      break;
  }

  return (
    <>
      <PageHeaderWrapper maxWidth={false}>
        <StockHeader stock={stock} getStock={() => getStock(ticker)} isFavorite={isFavorite} />
      </PageHeaderWrapper>
      <Container maxWidth={false}>
        <Card sx={{ width: detailsCardWidth, m: "auto" }}>
          <StockDetails stock={stock} />
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default StockModule;
