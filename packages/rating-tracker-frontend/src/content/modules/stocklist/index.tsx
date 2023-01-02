import PageHeader from "./PageHeader";
import PageTitleWrapper from "../../../components/PageTitleWrapper";
import { Card, Container } from "@mui/material";
import Footer from "../../../components/Footer";

import StocksTable, { StockFilter } from "./StocksTable";
import { useState } from "react";
import {
  Size,
  Style,
  Country,
  Industry,
  MSCIESGRating,
  StockListColumn,
  stockListColumnArray,
} from "rating-tracker-commons";

const StocklistModule = () => {
  const [filter, setFilter] = useState<StockFilter>({});
  const [columnFilter, setColumnFilter] = useState<StockListColumn[]>([
    ...stockListColumnArray,
  ]);

  const [refetchTrigger, setRefetchTrigger] = useState<boolean>(false);

  const triggerRefetch = () => {
    setRefetchTrigger((prevRefetchTrigger) => !prevRefetchTrigger);
  };

  const applyFilters = (
    totalScoreMin?: number,
    totalScoreMax?: number,
    financialScoreMin?: number,
    financialScoreMax?: number,
    esgScoreMin?: number,
    esgScoreMax?: number,
    dividendYieldPercentMin?: number,
    dividendYieldPercentMax?: number,
    priceEarningRatioMin?: number,
    priceEarningRatioMax?: number,
    starRatingMin?: number,
    starRatingMax?: number,
    morningstarFairValueDiffMin?: number,
    morningstarFairValueDiffMax?: number,
    analystConsensusMin?: number,
    analystConsensusMax?: number,
    analystCountMin?: number,
    analystCountMax?: number,
    analystTargetDiffMin?: number,
    analystTargetDiffMax?: number,
    msciESGRatingMin?: MSCIESGRating,
    msciESGRatingMax?: MSCIESGRating,
    msciTemperatureMin?: number,
    msciTemperatureMax?: number,
    refinitivESGScoreMin?: number,
    refinitivESGScoreMax?: number,
    refinitivEmissionsMin?: number,
    refinitivEmissionsMax?: number,
    spESGScoreMin?: number,
    spESGScoreMax?: number,
    sustainalyticsESGRiskMin?: number,
    sustainalyticsESGRiskMax?: number,
    countries?: Country[],
    industries?: Industry[],
    size?: Size,
    style?: Style
  ) => {
    setFilter({
      totalScoreMin,
      totalScoreMax,
      financialScoreMin,
      financialScoreMax,
      esgScoreMin,
      esgScoreMax,
      dividendYieldPercentMin,
      dividendYieldPercentMax,
      priceEarningRatioMin,
      priceEarningRatioMax,
      starRatingMin,
      starRatingMax,
      morningstarFairValueDiffMin,
      morningstarFairValueDiffMax,
      analystConsensusMin,
      analystConsensusMax,
      analystCountMin,
      analystCountMax,
      analystTargetDiffMin,
      analystTargetDiffMax,
      msciESGRatingMin,
      msciESGRatingMax,
      msciTemperatureMin,
      msciTemperatureMax,
      refinitivESGScoreMin,
      refinitivESGScoreMax,
      refinitivEmissionsMin,
      refinitivEmissionsMax,
      spESGScoreMin,
      spESGScoreMax,
      sustainalyticsESGRiskMin,
      sustainalyticsESGRiskMax,
      countries,
      industries,
      size,
      style,
    });
  };

  return (
    <>
      <PageTitleWrapper maxWidth={false}>
        <PageHeader
          applyFilters={applyFilters}
          columnFilter={columnFilter}
          setColumnFilter={setColumnFilter}
          triggerRefetch={triggerRefetch}
          filtersInUse={
            columnFilter.length < stockListColumnArray.length ||
            !!filter.totalScoreMin ||
            !!filter.totalScoreMax ||
            !!filter.financialScoreMin ||
            !!filter.financialScoreMax ||
            !!filter.esgScoreMin ||
            !!filter.esgScoreMax ||
            !!filter.dividendYieldPercentMin ||
            !!filter.dividendYieldPercentMax ||
            !!filter.priceEarningRatioMin ||
            !!filter.priceEarningRatioMax ||
            !!filter.starRatingMin ||
            !!filter.starRatingMax ||
            !!filter.morningstarFairValueDiffMin ||
            filter.morningstarFairValueDiffMin === 0 ||
            !!filter.morningstarFairValueDiffMax ||
            filter.morningstarFairValueDiffMax === 0 ||
            !!filter.analystConsensusMin ||
            !!filter.analystConsensusMax ||
            !!filter.analystCountMin ||
            !!filter.analystCountMax ||
            !!filter.analystTargetDiffMin ||
            filter.analystTargetDiffMin === 0 ||
            !!filter.analystTargetDiffMax ||
            filter.analystTargetDiffMax === 0 ||
            !!filter.msciESGRatingMin ||
            !!filter.msciESGRatingMax ||
            !!filter.msciTemperatureMin ||
            !!filter.msciTemperatureMax ||
            !!filter.refinitivESGScoreMin ||
            !!filter.refinitivESGScoreMax ||
            !!filter.refinitivEmissionsMin ||
            !!filter.refinitivEmissionsMax ||
            !!filter.spESGScoreMin ||
            !!filter.spESGScoreMax ||
            !!filter.sustainalyticsESGRiskMin ||
            !!filter.sustainalyticsESGRiskMax ||
            (!!filter.countries && filter.countries.length > 0) ||
            (!!filter.industries && filter.industries.length > 0) ||
            !!filter.size ||
            !!filter.style
          }
        />
      </PageTitleWrapper>
      <Container maxWidth={false}>
        <Card>
          <StocksTable
            filter={filter}
            triggerRefetch={refetchTrigger}
            columns={columnFilter}
          />
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default StocklistModule;
