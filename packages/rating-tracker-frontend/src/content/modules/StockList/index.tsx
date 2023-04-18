import PageHeader from "./PageHeader";
import PageTitleWrapper from "../../../components/PageTitleWrapper";
import { Card, Container } from "@mui/material";
import Footer from "../../../components/Footer";

import StocksTable from "./StocksTable";
import { StockFilter } from "../../../types/StockFilter";
import { useState } from "react";
import { StockListColumn, stockListColumnArray } from "rating-tracker-commons";

/**
 * A module that displays a list of stocks.
 * @returns {JSX.Element} The component.
 */
const StockListModule = (): JSX.Element => {
  const [filter, setFilter] = useState<StockFilter>({});
  const [columnFilter, setColumnFilter] = useState<StockListColumn[]>([...stockListColumnArray]);

  const [refetchTrigger, setRefetchTrigger] = useState<boolean>(false);

  const triggerRefetch = () => {
    setRefetchTrigger((prevRefetchTrigger) => !prevRefetchTrigger);
  };

  return (
    <>
      <PageTitleWrapper maxWidth={false}>
        <PageHeader
          setFilter={setFilter}
          columnFilter={columnFilter}
          setColumnFilter={setColumnFilter}
          triggerRefetch={triggerRefetch}
          filtersInUse={
            columnFilter.length < stockListColumnArray.length || // If not all columns are shown, or
            Object.values(filter).some(
              // If at least one filter is set, i.e., if at least one value
              (value) =>
                typeof value !== "undefined" && // is different from undefined, and
                (!Array.isArray(value) || // is not an array, or
                  value.length > 0) // is an array with at least one element
            )
          }
        />
      </PageTitleWrapper>
      <Container maxWidth={false}>
        <Card>
          <StocksTable filter={filter} triggerRefetch={refetchTrigger} columns={columnFilter} />
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default StockListModule;
