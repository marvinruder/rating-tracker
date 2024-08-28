import { Container } from "@mui/material";
import type { StockFilter, StockListColumn } from "@rating-tracker/commons";
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
const StockListModule = (): JSX.Element => {
  const [filter, setFilter] = useState<StockFilter>({});
  const [columnFilter, setColumnFilter] = useState<StockListColumn[]>([...stockListColumnArray]);
  const [refetchStocksTrigger, setRefetchStocksTrigger] = useState<boolean>(false);

  const refetchStocks = () => setRefetchStocksTrigger((prev) => !prev);

  return (
    <>
      <HeaderWrapper maxWidth={false}>
        <StockListHeader
          stockTableFiltersProps={{
            setFilter,
            columnFilter,
            setColumnFilter,
            filtersInUse:
              columnFilter.length < stockListColumnArray.length || // If not all columns are shown, or
              Object.values(filter).some(
                // If at least one filter is set, i.e., if at least one value
                (value) =>
                  typeof value !== "undefined" && // is different from undefined, and
                  (!Array.isArray(value) || // is not an array, or
                    value.length > 0), // is an array with at least one element
              ),
          }}
          refetchStocks={refetchStocks}
        />
      </HeaderWrapper>
      <Container maxWidth={false}>
        <StockTable filter={filter} refetchInitialStocksTrigger={refetchStocksTrigger} columns={columnFilter} />
      </Container>
      <Footer />
    </>
  );
};

export default StockListModule;
