import { Card, Container } from "@mui/material";
import { StockListColumn, Portfolio, stockListColumnArray, portfoliosEndpointPath } from "@rating-tracker/commons";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { Footer } from "../../../components/etc/Footer";
import { HeaderWrapper } from "../../../components/etc/HeaderWrapper";
import { StockTable } from "../../../components/stock/layouts/StockTable";
import { useNotification } from "../../../contexts/NotificationContext";
import { StockFilter } from "../../../types/StockFilter";
import api from "../../../utils/api";

import { PortfolioHeader } from "./PortfolioHeader";

/**
 * A module that displays a portfolio.
 *
 * @returns {JSX.Element} The component.
 */
const PortfolioModule = (): JSX.Element => {
  const [portfolio, setPortfolio] = useState<Portfolio>();
  const [filter, setFilter] = useState<StockFilter>({});
  const [columnFilter, setColumnFilter] = useState<StockListColumn[]>([...stockListColumnArray]);
  const { setErrorNotificationOrClearSession: setErrorNotification } = useNotification();

  const [refetchTrigger, setRefetchTrigger] = useState<boolean>(false);

  const triggerRefetch = () => {
    setRefetchTrigger((prevRefetchTrigger) => !prevRefetchTrigger);
  };

  /**
   * Fetches the portfolio with the given ID.
   *
   * @param {number} id The ID of the portfolio to fetch.
   */
  const getPortfolio = (id: number) => {
    api
      .get(portfoliosEndpointPath + `/${id}`)
      .then((res) => setPortfolio(res.data))
      .catch((e) => setErrorNotification(e, "fetching portfolio"));
  };

  const { id } = useParams();

  useEffect(() => getPortfolio(Number(id)), [id]);
  // useEffect(() => triggerRefetch(), [portfolio]);

  return (
    <>
      <HeaderWrapper maxWidth={false}>
        <PortfolioHeader
          portfolio={portfolio}
          getPortfolio={() => (getPortfolio(Number(id)), triggerRefetch())}
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
            disableTopMargin: true,
          }}
        />
      </HeaderWrapper>
      <Container maxWidth={false}>
        <Card>
          <StockTable
            filter={filter}
            triggerRefetch={refetchTrigger}
            loading={!portfolio}
            portfolio={portfolio ?? null}
            columns={columnFilter}
          />
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default PortfolioModule;
