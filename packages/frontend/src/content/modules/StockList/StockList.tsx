import { Container } from "@mui/material";
import type { StockListColumn } from "@rating-tracker/commons";
import { stockListColumnArray } from "@rating-tracker/commons";
import { useState } from "react";

import { Footer } from "../../../components/etc/Footer";
import { HeaderWrapper } from "../../../components/etc/HeaderWrapper";
import { StockTable } from "../../../components/stock/layouts/StockTable";

import StockListHeader from "./StockListHeader";

/**
 * A module that displays a list of stocks.
 * @returns The component.
 */
const StockListModule = (): React.JSX.Element => {
  const [columnFilter, setColumnFilter] = useState<StockListColumn[]>([...stockListColumnArray]);
  const [refetchStocksTrigger, setRefetchStocksTrigger] = useState<boolean>(false);

  const refetchStocks = () => setRefetchStocksTrigger((prev) => !prev);

  return (
    <>
      <HeaderWrapper maxWidth={false}>
        <StockListHeader stockTableFiltersProps={{ columnFilter, setColumnFilter }} refetchStocks={refetchStocks} />
      </HeaderWrapper>
      <Container maxWidth={false}>
        <StockTable refetchInitialStocksTrigger={refetchStocksTrigger} columns={columnFilter} />
      </Container>
      <Footer />
    </>
  );
};

export default StockListModule;
