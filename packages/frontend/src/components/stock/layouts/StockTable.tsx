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
  Tooltip,
  Box,
  useTheme,
} from "@mui/material";
import type { Portfolio, SortableAttribute, Stock, StockListColumn, Watchlist } from "@rating-tracker/commons";
import { favoritesEndpointPath, stocksEndpointPath } from "@rating-tracker/commons";
import type { FC, ChangeEvent } from "react";
import { useState, useEffect } from "react";

import { useNotification } from "../../../contexts/NotificationContext";
import type { StockFilter } from "../../../types/StockFilter";
import api from "../../../utils/api";
import { PropertyDescription } from "../properties/PropertyDescription";

import { StockRow } from "./StockRow";

/**
 * The stocks table component.
 *
 * @param {StockTableProps} props The component props.
 * @returns {JSX.Element} The stocks table component.
 */
export const StockTable: FC<StockTableProps> = (props: StockTableProps): JSX.Element => {
  const [page, setPage] = useState<number>(0);
  const [count, setCount] = useState<number>(-1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [stocksFinal, setStocksFinal] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortableAttribute>(props.portfolio !== undefined ? "amount" : "totalScore");
  const [sortDesc, setSortDesc] = useState<boolean>(true);
  const { setErrorNotificationOrClearSession: setErrorNotification } = useNotification();

  const theme = useTheme();

  useEffect(() => {
    // Get stocks whenever pagination, sorting or filtering changes, or when explicitly requested.
    !props.loading && getStocks();
  }, [page, rowsPerPage, sortBy, sortDesc, props.filter, props.triggerRefetch, props.loading]);

  /**
   * Get the stocks from the backend.
   */
  const getStocks = () => {
    setStocksFinal(false);
    void Promise.allSettled([
      api
        .get(stocksEndpointPath, {
          params: {
            // Pagination
            offset: page * rowsPerPage,
            count: rowsPerPage > 0 ? rowsPerPage : undefined,
            // Sorting
            sortBy: sortBy,
            sortDesc: sortDesc,
            // Filtering
            ...props.filter,
            // Do not include raw country and industry arrays in the request.
            countries: undefined,
            industries: undefined,
            country: props.filter.countries?.length > 0 ? props.filter.countries.join(",") : undefined,
            industry: props.filter.industries?.length > 0 ? props.filter.industries.join(",") : undefined,
            watchlist: props.watchlist?.id,
            portfolio: props.portfolio?.id,
          },
        })
        .then((res) => {
          setStocks(res.data.stocks);
          setCount(res.data.count);
        })
        .catch((e) => {
          setErrorNotification(e, "fetching stocks");
          setStocks([]);
          setCount(0);
        }),
      api
        .get(favoritesEndpointPath)
        .then((res) => setFavorites((res.data.stocks as Stock[]).map((stock) => stock.ticker)))
        .catch((e) => {
          setErrorNotification(e, "fetching favorites");
          setFavorites([]);
        }),
    ]).finally(() => setStocksFinal(true));
  };

  /**
   * Handle a click on one of the pagination buttons.
   *
   * @param {React.MouseEvent} _ The event.
   * @param {number} newPage The new page.
   */
  const handlePageChange = (_: React.MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  /**
   * Handle a change in the number of rows per page, triggered by the row count dropdown.
   *
   * @param {ChangeEvent<HTMLInputElement>} event The event.
   */
  const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPage(0); // Go to the first page to not get confused.
    setRowsPerPage(parseInt(event.target.value));
  };

  /**
   * Provides a handler for a click on one of the sort labels.
   *
   * @param {SortableAttribute} attribute The attribute having been clicked.
   * @returns {() => void} The handler.
   */
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
          "lsegESGScore",
          "lsegEmissions",
          "spESGScore",
          "dividendYieldPercent",
          "amount",
        ].includes(attribute),
      );
    }
  };

  /**
   * Returns an appropriate CSS `display` property value for a column. The value is derived from the
   * columns filter values that are passed to the component.
   *
   * @param {StockListColumn} column The column for which the display value should be returned.
   * @returns {"none" | undefined} The CSS `display` property value.
   */
  const displayColumn = (column: StockListColumn): "none" | undefined => {
    if (props.columns && !props.columns.includes(column)) {
      // If the filter is in use, but the column is not included, hide the column.
      return "none";
    }
    // If unset, the column is visible.
    return undefined;
  };

  return (
    <>
      <TableContainer sx={{ overscrollBehaviorX: "none" }}>
        <Table size="small">
          {stocksFinal && !props.loading && !stocks.length ? (
            <></>
          ) : (
            <TableHead>
              <TableRow sx={{ height: 52.5 }}>
                {/* Actions */}
                <TableCell />
                {/* Amount in Portfolio */}
                {props.portfolio !== undefined && (
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "amount"}
                      direction={sortBy !== "amount" || sortDesc ? "desc" : "asc"}
                      onClick={handleSortLabelClicked("amount")}
                    >
                      <Tooltip title={<PropertyDescription property="amount" />} arrow>
                        <Box display="inline-block">Amount</Box>
                      </Tooltip>
                    </TableSortLabel>
                  </TableCell>
                )}
                {/* Name and Logo */}
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "name"}
                    direction={sortBy === "name" && sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("name")}
                  >
                    Stock
                  </TableSortLabel>
                </TableCell>
                {/* Country and Region */}
                <TableCell sx={{ display: displayColumn("Country") }}>
                  <Tooltip title={<PropertyDescription property="country" />} arrow>
                    <Box display="inline-block">Country</Box>
                  </Tooltip>
                </TableCell>
                {/* StyleBox */}
                <TableCell sx={{ display: displayColumn("Size and Style") }}>
                  <TableSortLabel
                    active={sortBy === "size"}
                    direction={sortBy !== "size" || sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("size")}
                  >
                    <Tooltip title={<PropertyDescription property="size" />} arrow placement="top">
                      <Box display="inline-block">Size</Box>
                    </Tooltip>
                  </TableSortLabel>
                  <br />
                  <TableSortLabel
                    active={sortBy === "style"}
                    direction={sortBy === "style" && sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("style")}
                  >
                    <Tooltip title={<PropertyDescription property="style" />} arrow placement="bottom">
                      <Box display="inline-block">Style</Box>
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                {/* Sector */}
                <TableCell sx={{ display: displayColumn("Sector") }}>
                  <Tooltip title={<PropertyDescription property="sector" />} arrow>
                    <Box display="inline-block">Sector</Box>
                  </Tooltip>
                </TableCell>
                {/* Industry */}
                <TableCell sx={{ display: displayColumn("Industry") }}>
                  <Tooltip title={<PropertyDescription property="industry" />} arrow>
                    <Box display="inline-block">Industry</Box>
                  </Tooltip>
                </TableCell>
                {/* Total Score */}
                <TableCell sx={{ display: displayColumn("Total Score") }}>
                  <TableSortLabel
                    active={sortBy === "totalScore"}
                    direction={sortBy !== "totalScore" || sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("totalScore")}
                  >
                    <Tooltip title={<PropertyDescription property="totalScore" />} arrow>
                      <Box display="inline-block">Total</Box>
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                {/* Financial Score */}
                <TableCell sx={{ display: displayColumn("Financial Score") }}>
                  <TableSortLabel
                    active={sortBy === "financialScore"}
                    direction={sortBy !== "financialScore" || sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("financialScore")}
                  >
                    <Tooltip title={<PropertyDescription property="financialScore" />} arrow>
                      <Box display="inline-block">Financial</Box>
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                {/* ESG Score */}
                <TableCell sx={{ display: displayColumn("ESG Score") }}>
                  <TableSortLabel
                    active={sortBy === "esgScore"}
                    direction={sortBy !== "esgScore" || sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("esgScore")}
                  >
                    <Tooltip title={<PropertyDescription property="esgScore" />} arrow>
                      <Box display="inline-block">ESG</Box>
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                {/* Morningstar Star Rating */}
                <TableCell sx={{ display: displayColumn("Star Rating") }}>
                  <TableSortLabel
                    active={sortBy === "starRating"}
                    direction={sortBy !== "starRating" || sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("starRating")}
                  >
                    <Tooltip title={<PropertyDescription property="starRating" />} arrow>
                      <Box display="inline-block">Star Rating</Box>
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                {/* Morningstar Fair Value */}
                <TableCell sx={{ display: displayColumn("Morningstar Fair Value") }}>
                  <TableSortLabel
                    active={sortBy === "morningstarFairValuePercentageToLastClose"}
                    direction={sortBy === "morningstarFairValuePercentageToLastClose" && sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("morningstarFairValuePercentageToLastClose")}
                  >
                    <Tooltip title={<PropertyDescription property="morningstarFairValue" />} arrow>
                      <Box display="inline-block">Fair Value</Box>
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                {/* Analyst Consensus */}
                <TableCell sx={{ display: displayColumn("Analyst Consensus") }}>
                  <TableSortLabel
                    active={sortBy === "analystConsensus"}
                    direction={sortBy !== "analystConsensus" || sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("analystConsensus")}
                  >
                    <Tooltip title={<PropertyDescription property="analystConsensus" />} arrow>
                      <Box display="inline-block">Anlst Consns</Box>
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                {/* Analyst Target Price */}
                <TableCell sx={{ display: displayColumn("Analyst Target Price") }}>
                  <TableSortLabel
                    active={sortBy === "analystTargetPricePercentageToLastClose"}
                    direction={sortBy === "analystTargetPricePercentageToLastClose" && sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("analystTargetPricePercentageToLastClose")}
                  >
                    <Tooltip title={<PropertyDescription property="analystTargetPrice" />} arrow>
                      <Box display="inline-block">Analyst Target</Box>
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                {/* MSCI ESG Rating */}
                <TableCell sx={{ display: displayColumn("MSCI ESG Rating") }}>
                  <TableSortLabel
                    active={sortBy === "msciESGRating"}
                    direction={sortBy === "msciESGRating" && sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("msciESGRating")}
                  >
                    <Tooltip title={<PropertyDescription property="msciESGRating" />} arrow>
                      <Box display="inline-block">MSCI ESG</Box>
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                {/* MSCI Implied Temperature Rise */}
                <TableCell sx={{ display: displayColumn("MSCI Implied Temperature Rise") }}>
                  <TableSortLabel
                    active={sortBy === "msciTemperature"}
                    direction={sortBy === "msciTemperature" && sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("msciTemperature")}
                  >
                    <Tooltip title={<PropertyDescription property="msciTemperature" />} arrow>
                      <Box display="inline-block">MSCI Temp</Box>
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                {/* LSEG */}
                <TableCell sx={{ display: displayColumn("LSEG ESG Information") }}>
                  <TableSortLabel
                    active={sortBy === "lsegESGScore"}
                    direction={sortBy !== "lsegESGScore" || sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("lsegESGScore")}
                  >
                    <Tooltip title={<PropertyDescription property="lsegESGScore" />} arrow placement="top">
                      <Box display="inline-block">LSEG</Box>
                    </Tooltip>
                  </TableSortLabel>
                  <br />
                  <TableSortLabel
                    active={sortBy === "lsegEmissions"}
                    direction={sortBy !== "lsegEmissions" || sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("lsegEmissions")}
                    sx={{ flexDirection: "row-reverse" }}
                  >
                    <Tooltip title={<PropertyDescription property="lsegEmissions" />} arrow placement="bottom">
                      <Box display="inline-block">Emissions</Box>
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                {/* S&P ESG Score */}
                <TableCell sx={{ display: displayColumn("S&P ESG Score") }}>
                  <TableSortLabel
                    active={sortBy === "spESGScore"}
                    direction={sortBy !== "spESGScore" || sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("spESGScore")}
                  >
                    <Tooltip title={<PropertyDescription property="spESGScore" />} arrow>
                      <Box display="inline-block">S&P</Box>
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                {/* Sustainalytics ESG Risk */}
                <TableCell sx={{ display: displayColumn("Sustainalytics ESG Risk") }}>
                  <TableSortLabel
                    active={sortBy === "sustainalyticsESGRisk"}
                    direction={sortBy === "sustainalyticsESGRisk" && sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("sustainalyticsESGRisk")}
                  >
                    <Tooltip title={<PropertyDescription property="sustainalyticsESGRisk" />} arrow>
                      <Box display="inline-block">Sustain-alytics</Box>
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                {/* 52 Week Range */}
                <TableCell sx={{ display: displayColumn("52 Week Range") }}>
                  <TableSortLabel
                    active={sortBy === "positionIn52w"}
                    direction={sortBy === "positionIn52w" && sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("positionIn52w")}
                  >
                    <Tooltip title={<PropertyDescription property="positionIn52w" />} arrow>
                      <Box display="inline-block">52W Range</Box>
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                {/* Dividend Yield */}
                <TableCell sx={{ display: displayColumn("Dividend Yield (%)") }}>
                  <TableSortLabel
                    active={sortBy === "dividendYieldPercent"}
                    direction={sortBy !== "dividendYieldPercent" || sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("dividendYieldPercent")}
                  >
                    <Tooltip title={<PropertyDescription property="dividendYieldPercent" />} arrow>
                      <Box display="inline-block">Div Yield</Box>
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                {/* P/E Ratio */}
                <TableCell sx={{ display: displayColumn("P / E Ratio") }}>
                  <TableSortLabel
                    active={sortBy === "priceEarningRatio"}
                    direction={sortBy === "priceEarningRatio" && sortDesc ? "desc" : "asc"}
                    onClick={handleSortLabelClicked("priceEarningRatio")}
                  >
                    <Tooltip title={<PropertyDescription property="priceEarningRatio" />} arrow>
                      <Box display="inline-block">P/E</Box>
                    </Tooltip>
                  </TableSortLabel>
                </TableCell>
                {/* Market Cap */}
                <TableCell sx={{ display: displayColumn("Market Capitalization") }}>
                  <Tooltip title={<PropertyDescription property="marketCap" />} arrow>
                    <Box display="inline-block">Market Cap</Box>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {stocksFinal && !props.loading ? (
              stocks.length ? (
                stocks.map((stock) => (
                  // Render stock rows
                  <StockRow
                    stock={stock}
                    isFavorite={favorites.includes(stock.ticker)}
                    getStocks={() => {
                      getStocks();
                      props.getPortfolio && props.getPortfolio();
                    }}
                    key={stock.ticker}
                    columns={props.columns}
                    watchlist={props.watchlist}
                    portfolio={props.portfolio}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell>
                    <Typography textAlign="center" variant="subtitle1">
                      No Stocks
                    </Typography>
                  </TableCell>
                </TableRow>
              )
            ) : (
              [...Array(rowsPerPage > 0 ? rowsPerPage : 100)].map(
                // Render skeleton rows,
                (_, key) => (
                  <StockRow key={key} getStocks={getStocks} columns={props.columns} portfolio={props.portfolio} />
                ),
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
        sx={{
          ".MuiTablePagination-actions": {
            ml: { xs: `${theme.spacing(1)} !important`, sm: `${theme.spacing(2)} !important` },
          },
        }}
        labelRowsPerPage={
          <>
            <Typography variant="caption" sx={{ display: { xs: "none", sm: "block" } }}>
              <strong>Rows per page</strong>
            </Typography>
            <Typography variant="caption" sx={{ ml: "8px", display: { xs: "block", sm: "none" } }}>
              <strong>Show</strong>
            </Typography>
          </>
        }
        slotProps={{ select: { sx: { mr: { xs: 0, sm: 4 } } } }}
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

/**
 * Properties for the StocksTable component.
 */
interface StockTableProps {
  /**
   * The filter to apply to the stocks.
   */
  filter: StockFilter;
  /**
   * A variable that is toggled to trigger a refetch of the stocks.
   */
  triggerRefetch?: boolean;
  /**
   * The columns to display. If unset, all columns will be displayed.
   */
  columns?: StockListColumn[];
  /**
   * A watchlist. If set, the stock list will be filtered to only include stocks that are in the watchlist.
   */
  watchlist?: Watchlist;
  /**
   * A portfolio. If set, the stock list will be filtered to only include stocks that are in the portfolio. Also, the
   * amounts of the stocks in the portfolio will be displayed. If set to `null`, the stock table will show stocks from a
   * portfolio, but the portfolio is not yet loaded.
   */
  portfolio?: Portfolio | null;
  /**
   * A method to update the portfolio, e.g. after a stock’s amount was modified.
   */
  getPortfolio?: () => void;
  /**
   * Whether the skeleton rows should be shown.
   */
  loading?: boolean;
}
