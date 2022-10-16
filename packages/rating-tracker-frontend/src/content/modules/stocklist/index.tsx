import PageHeader from "./PageHeader";
import PageTitleWrapper from "src/components/PageTitleWrapper";
import { Card, Grid, Container } from "@mui/material";
import Footer from "src/components/Footer";

import StocksTable, { StockFilter } from "./StocksTable";
import { useState } from "react";
import { Size, Style, Country, Industry } from "src/types";

function StocklistModule() {
  const [filter, setFilter] = useState<StockFilter>({});

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
              <StocksTable filter={filter} />
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default StocklistModule;
