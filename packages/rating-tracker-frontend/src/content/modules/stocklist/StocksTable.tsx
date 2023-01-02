import { FC, ChangeEvent, useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableContainer,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { MSCIESGRating, Stock, StockListColumn } from "rating-tracker-commons";
import { baseUrl, stockAPI, stockListEndpoint } from "../../../endpoints";
import {
  Country,
  Industry,
  Size,
  SortableAttribute,
  Style,
} from "rating-tracker-commons";
import StockRow from "../../../components/StockRow";
import useNotification from "../../../helpers/useNotification";

const StocksTable: FC<StocksTableProps> = (props: StocksTableProps) => {
  const [page, setPage] = useState<number>(0);
  const [count, setCount] = useState<number>(-1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stocksFinal, setStocksFinal] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortableAttribute>("totalScore");
  const [sortDesc, setSortDesc] = useState<boolean>(true);
  const { setNotification } = useNotification();

  useEffect(() => {
    getStocks();
  }, [page, rowsPerPage, sortBy, sortDesc, props.filter, props.triggerRefetch]);

  const getStocks = () => {
    setStocksFinal(false);
    axios
      .get(baseUrl + stockAPI + stockListEndpoint, {
        params: {
          offset: page * rowsPerPage,
          count: rowsPerPage > 0 ? rowsPerPage : undefined,
          sortBy: sortBy,
          sortDesc: sortDesc,
          totalScoreMin: props.filter.totalScoreMin,
          totalScoreMax: props.filter.totalScoreMax,
          financialScoreMin: props.filter.financialScoreMin,
          financialScoreMax: props.filter.financialScoreMax,
          esgScoreMin: props.filter.esgScoreMin,
          esgScoreMax: props.filter.esgScoreMax,
          dividendYieldPercentMin: props.filter.dividendYieldPercentMin,
          dividendYieldPercentMax: props.filter.dividendYieldPercentMax,
          priceEarningRatioMin: props.filter.priceEarningRatioMin,
          priceEarningRatioMax: props.filter.priceEarningRatioMax,
          starRatingMin: props.filter.starRatingMin,
          starRatingMax: props.filter.starRatingMax,
          morningstarFairValueDiffMin: props.filter.morningstarFairValueDiffMin,
          morningstarFairValueDiffMax: props.filter.morningstarFairValueDiffMax,
          analystConsensusMin: props.filter.analystConsensusMin,
          analystConsensusMax: props.filter.analystConsensusMax,
          analystCountMin: props.filter.analystCountMin,
          analystCountMax: props.filter.analystCountMax,
          analystTargetDiffMin: props.filter.analystTargetDiffMin,
          analystTargetDiffMax: props.filter.analystTargetDiffMax,
          msciESGRatingMin: props.filter.msciESGRatingMin,
          msciESGRatingMax: props.filter.msciESGRatingMax,
          msciTemperatureMin: props.filter.msciTemperatureMin,
          msciTemperatureMax: props.filter.msciTemperatureMax,
          refinitivESGScoreMin: props.filter.refinitivESGScoreMin,
          refinitivESGScoreMax: props.filter.refinitivESGScoreMax,
          refinitivEmissionsMin: props.filter.refinitivEmissionsMin,
          refinitivEmissionsMax: props.filter.refinitivEmissionsMax,
          spESGScoreMin: props.filter.spESGScoreMin,
          spESGScoreMax: props.filter.spESGScoreMax,
          sustainalyticsESGRiskMin: props.filter.sustainalyticsESGRiskMin,
          sustainalyticsESGRiskMax: props.filter.sustainalyticsESGRiskMax,
          country:
            props.filter.countries?.length > 0
              ? props.filter.countries.join(",")
              : undefined,
          industry:
            props.filter.industries?.length > 0
              ? props.filter.industries.join(",")
              : undefined,
          size: props.filter.size,
          style: props.filter.style,
        },
      })
      .then((res) => {
        setStocks(res.data.stocks.map((stock: any) => new Stock(stock)));
        setCount(res.data.count);
      })
      .catch((e) => {
        setNotification({
          severity: "error",
          title: "Error while fetching stock information",
          message:
            e.response?.status && e.response?.data?.message
              ? `${e.response.status}: ${e.response.data.message}`
              : e.message ?? "No additional information available.",
        });
        setStocks([]);
        setCount(0);
      })
      .finally(() => setStocksFinal(true));
  };

  const handlePageChange = (event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value));
  };

  const handleSortLabelClicked = (attribute: SortableAttribute) => () => {
    if (sortBy === attribute) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(attribute);
      setSortDesc(
        [
          "size",
          "totalScore",
          "financialScore",
          "esgScore",
          "starRating",
          "analystConsensus",
          "refinitivESGScore",
          "refinitivEmissions",
          "spESGScore",
          "dividendYieldPercent",
        ].includes(attribute)
      );
    }
  };

  const displayColumn = (column: StockListColumn): "none" | undefined => {
    if (props.columns && !props.columns.includes(column)) {
      return "none";
    }
    return undefined;
  };

  return (
    <>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ height: 52.5 }}>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "name"}
                  direction={sortBy === "name" && sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("name")}
                >
                  Stock
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("Country"),
                }}
              >
                Country
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("Size and Style"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "size"}
                  direction={sortBy !== "size" || sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("size")}
                >
                  Size
                </TableSortLabel>
                <br />
                <TableSortLabel
                  active={sortBy === "style"}
                  direction={sortBy === "style" && sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("style")}
                >
                  Style
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("Sector"),
                }}
              >
                Sector
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("Industry"),
                }}
              >
                Industry
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("Total Score"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "totalScore"}
                  direction={
                    sortBy !== "totalScore" || sortDesc ? "desc" : "asc"
                  }
                  onClick={handleSortLabelClicked("totalScore")}
                >
                  Score
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("Financial Score"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "financialScore"}
                  direction={
                    sortBy !== "financialScore" || sortDesc ? "desc" : "asc"
                  }
                  onClick={handleSortLabelClicked("financialScore")}
                >
                  Financial
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("ESG Score"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "esgScore"}
                  direction={sortBy !== "esgScore" || sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("esgScore")}
                >
                  ESG
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("Star Rating"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "starRating"}
                  direction={
                    sortBy !== "starRating" || sortDesc ? "desc" : "asc"
                  }
                  onClick={handleSortLabelClicked("starRating")}
                >
                  Star Rating
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("Morningstar Fair Value"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "morningstarFairValue"}
                  direction={
                    sortBy === "morningstarFairValue" && sortDesc
                      ? "desc"
                      : "asc"
                  }
                  onClick={handleSortLabelClicked("morningstarFairValue")}
                >
                  Fair Value
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("Analyst Consensus"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "analystConsensus"}
                  direction={
                    sortBy !== "analystConsensus" || sortDesc ? "desc" : "asc"
                  }
                  onClick={handleSortLabelClicked("analystConsensus")}
                >
                  Anlst Consns
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("Analyst Target Price"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "analystTargetPrice"}
                  direction={
                    sortBy === "analystTargetPrice" && sortDesc ? "desc" : "asc"
                  }
                  onClick={handleSortLabelClicked("analystTargetPrice")}
                >
                  Analyst Target
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("MSCI ESG Rating"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "msciESGRating"}
                  direction={
                    sortBy === "msciESGRating" && sortDesc ? "desc" : "asc"
                  }
                  onClick={handleSortLabelClicked("msciESGRating")}
                >
                  MSCI ESG
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("MSCI Implied Temperature Rise"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "msciTemperature"}
                  direction={
                    sortBy === "msciTemperature" && sortDesc ? "desc" : "asc"
                  }
                  onClick={handleSortLabelClicked("msciTemperature")}
                >
                  MSCI Temp
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("Refinitiv ESG Information"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "refinitivESGScore"}
                  direction={
                    sortBy !== "refinitivESGScore" || sortDesc ? "desc" : "asc"
                  }
                  onClick={handleSortLabelClicked("refinitivESGScore")}
                >
                  Refinitiv
                </TableSortLabel>
                <br />
                <TableSortLabel
                  active={sortBy === "refinitivEmissions"}
                  direction={
                    sortBy !== "refinitivEmissions" || sortDesc ? "desc" : "asc"
                  }
                  onClick={handleSortLabelClicked("refinitivEmissions")}
                  sx={{ flexDirection: "row-reverse" }}
                >
                  Emissions
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("S&P ESG Score"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "spESGScore"}
                  direction={
                    sortBy !== "spESGScore" || sortDesc ? "desc" : "asc"
                  }
                  onClick={handleSortLabelClicked("spESGScore")}
                >
                  S&P
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("Sustainalytics ESG Risk"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "sustainalyticsESGRisk"}
                  direction={
                    sortBy === "sustainalyticsESGRisk" && sortDesc
                      ? "desc"
                      : "asc"
                  }
                  onClick={handleSortLabelClicked("sustainalyticsESGRisk")}
                >
                  Sustain-alytics
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("52 Week Range"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "52w"}
                  direction={sortBy === "52w" && sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("52w")}
                >
                  52W Range
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("Dividend Yield (%)"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "dividendYieldPercent"}
                  direction={
                    sortBy !== "dividendYieldPercent" || sortDesc
                      ? "desc"
                      : "asc"
                  }
                  onClick={handleSortLabelClicked("dividendYieldPercent")}
                >
                  Div Yield
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("P / E Ratio"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "priceEarningRatio"}
                  direction={
                    sortBy === "priceEarningRatio" && sortDesc ? "desc" : "asc"
                  }
                  onClick={handleSortLabelClicked("priceEarningRatio")}
                >
                  P/E
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  display: displayColumn("Market Capitalization"),
                }}
              >
                Market Cap
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stocksFinal
              ? stocks.map((stock) => (
                  <StockRow
                    stock={stock}
                    getStocks={getStocks}
                    key={stock.ticker}
                    columns={props.columns}
                  />
                ))
              : [...Array(rowsPerPage > 0 ? rowsPerPage : 100)].map(
                  (_undef, key) => (
                    <StockRow
                      key={key}
                      getStocks={getStocks}
                      columns={props.columns}
                    />
                  )
                )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={count}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 100, { label: "All", value: -1 }]}
        showFirstButton
        showLastButton
        labelRowsPerPage={
          <Typography variant="caption" sx={{ ml: "8px" }}>
            <strong>Rows per page</strong>
          </Typography>
        }
        labelDisplayedRows={({ from, to, count }) => (
          <Typography variant="caption" sx={{ ml: "8px" }}>
            <strong>
              {from}–{to} of {count}
            </strong>
          </Typography>
        )}
      />
    </>
  );
};

export interface StockFilter {
  totalScoreMin?: number;
  totalScoreMax?: number;
  financialScoreMin?: number;
  financialScoreMax?: number;
  esgScoreMin?: number;
  esgScoreMax?: number;
  dividendYieldPercentMin?: number;
  dividendYieldPercentMax?: number;
  priceEarningRatioMin?: number;
  priceEarningRatioMax?: number;
  starRatingMin?: number;
  starRatingMax?: number;
  morningstarFairValueDiffMin?: number;
  morningstarFairValueDiffMax?: number;
  analystConsensusMin?: number;
  analystConsensusMax?: number;
  analystCountMin?: number;
  analystCountMax?: number;
  analystTargetDiffMin?: number;
  analystTargetDiffMax?: number;
  msciESGRatingMin?: MSCIESGRating;
  msciESGRatingMax?: MSCIESGRating;
  msciTemperatureMin?: number;
  msciTemperatureMax?: number;
  refinitivESGScoreMin?: number;
  refinitivESGScoreMax?: number;
  refinitivEmissionsMin?: number;
  refinitivEmissionsMax?: number;
  spESGScoreMin?: number;
  spESGScoreMax?: number;
  sustainalyticsESGRiskMin?: number;
  sustainalyticsESGRiskMax?: number;
  countries?: Country[];
  industries?: Industry[];
  size?: Size;
  style?: Style;
}

interface StocksTableProps {
  filter: StockFilter;
  triggerRefetch?: boolean;
  columns?: StockListColumn[];
}

export default StocksTable;
