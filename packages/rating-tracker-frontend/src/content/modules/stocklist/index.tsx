import PageHeader from "./PageHeader";
import PageTitleWrapper from "../../../components/PageTitleWrapper";
import { Card, Grid, Container } from "@mui/material";
import Footer from "../../../components/Footer";

import StocksTable, { StockFilter } from "./StocksTable";
import { useState } from "react";
import { Size, Style, Country, Industry } from "rating-tracker-commons";

function StocklistModule() {
  const [filter, setFilter] = useState<StockFilter>({});
  const [refetchTrigger, setRefetchTrigger] = useState<boolean>(false);

  const triggerRefetch = () => {
    setRefetchTrigger((prevRefetchTrigger) => !prevRefetchTrigger);
  };

  const applyFilters = (
    name?: string,
    size?: Size,
    style?: Style,
    countries?: Country[],
    industries?: Industry[]
  ) => {
    setFilter({
      name: name ? name : "",
      size: size,
      style: style,
      countries: countries,
      industries: industries,
    });
  };

  return (
    <>
      <PageTitleWrapper>
        <PageHeader
          applyFilters={applyFilters}
          triggerRefetch={triggerRefetch}
          filtersInUse={
            !!filter.name ||
            !!filter.size ||
            !!filter.style ||
            (!!filter.countries && filter.countries.length > 0) ||
            (!!filter.industries && filter.industries.length > 0)
          }
        />
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <Card>
              <StocksTable filter={filter} triggerRefetch={refetchTrigger} />
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default StocklistModule;
