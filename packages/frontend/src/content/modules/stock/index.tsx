import { Card, Container, useMediaQuery } from "@mui/material";
import axios from "axios";
import { baseUrl } from "../../../router";
import { Stock, stockEndpointPath } from "@rating-tracker/commons";
import { useEffect, useState } from "react";
import Footer from "../../../components/Footer";
import PageTitleWrapper from "../../../components/PageTitleWrapper";
import StockDetails from "../../../components/StockDetails";
import PageHeader from "./PageHeader";
import { useNotification } from "../../../contexts/NotificationContext";
import { useParams } from "react-router";

/**
 * A module that displays the details of a stock.
 *
 * @returns {JSX.Element} The component.
 */
const StockModule = (): JSX.Element => {
  const [stock, setStock] = useState<Stock>();

  const { setNotification } = useNotification();

  /**
   * Fetches the stock with the given ticker.
   *
   * @param {string} ticker The ticker of the stock to fetch.
   */
  const getStock = (ticker: string) => {
    axios
      .get(baseUrl + stockEndpointPath + `/${ticker}`)
      .then((res) => setStock(res.data))
      .catch((e) => {
        setNotification({
          severity: "error",
          title: "Error while fetching the stock",
          message:
            e.response?.status && e.response?.data?.message
              ? `${e.response.status}: ${e.response.data.message}`
              : e.message ?? "No additional information available.",
        });
      });
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
      <PageTitleWrapper maxWidth={false}>
        <PageHeader stock={stock} getStock={() => getStock(ticker)} />
      </PageTitleWrapper>
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
