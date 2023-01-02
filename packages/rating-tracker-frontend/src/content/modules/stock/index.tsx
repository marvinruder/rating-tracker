import { Card, Container, useMediaQuery } from "@mui/material";
import axios from "axios";
import { baseUrl, stockAPI } from "../../../endpoints";
import { Stock } from "rating-tracker-commons";
import { useEffect, useState } from "react";
import Footer from "../../../components/Footer";
import PageTitleWrapper from "../../../components/PageTitleWrapper";
import StockDetails from "../../../components/StockDetails";
import PageHeader from "./PageHeader";
import useNotification from "../../../helpers/useNotification";
import { useParams } from "react-router";

const StockModule = () => {
  const [stock, setStock] = useState<Stock>();

  const { setNotification } = useNotification();

  const getStock = (ticker: string) => {
    axios
      .get(baseUrl + stockAPI + `/${ticker}`)
      .then((res) => {
        setStock(new Stock(res.data));
      })
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

  let detailsCardWidth: 900 | 600 | 300;

  switch (
    +useMediaQuery("(min-width:964px)") + +useMediaQuery("(min-width:664px)")
  ) {
    case 2:
      detailsCardWidth = 900;
      break;
    case 1:
      detailsCardWidth = 600;
      break;
    case 0:
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
