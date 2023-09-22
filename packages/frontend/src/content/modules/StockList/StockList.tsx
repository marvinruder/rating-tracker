import { Card, Container } from "@mui/material";
import { StockListColumn, stockListColumnArray } from "@rating-tracker/commons";
import { useState } from "react";

import { Footer, PageHeaderWrapper } from "../../../components/etc/HeaderFooter";
import { StockTable } from "../../../components/etc/StockTable";
import { StockFilter } from "../../../types/StockFilter";

import StockListHeader from "./StockListHeader";

/**
 * A module that displays a list of stocks.
 *
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
      <PageHeaderWrapper maxWidth={false}>
        <StockListHeader
          stockTableFiltersProps={{
            setFilter,
            columnFilter,
            setColumnFilter,
            triggerRefetch,
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
          triggerRefetch={triggerRefetch}
        />
      </PageHeaderWrapper>
      <Container maxWidth={false}>
        <Card>
          <StockTable filter={filter} triggerRefetch={refetchTrigger} columns={columnFilter} />
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default StockListModule;
