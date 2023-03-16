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
  Tooltip,
  Box,
} from "@mui/material";
import { Stock, StockListColumn, stockListEndpointPath } from "rating-tracker-commons";
import { baseUrl } from "../../../router";
import { SortableAttribute } from "rating-tracker-commons";
import StockRow from "../../../components/StockRow";
import { useNotification } from "../../../contexts/NotificationContext";
import { StockFilter } from "../../../types/StockFilter";

/**
 * The stocks table component.
 *
 * @param {StocksTableProps} props The component props.
 * @returns {JSX.Element} The stocks table component.
 */
const StocksTable: FC<StocksTableProps> = (props: StocksTableProps): JSX.Element => {
  const [page, setPage] = useState<number>(0);
  const [count, setCount] = useState<number>(-1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stocksFinal, setStocksFinal] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortableAttribute>("totalScore");
  const [sortDesc, setSortDesc] = useState<boolean>(true);
  const { setNotification } = useNotification();

  useEffect(() => {
    getStocks(); // Get stocks whenever pagination, sorting or filtering changes, or when explicitly requested.
  }, [page, rowsPerPage, sortBy, sortDesc, props.filter, props.triggerRefetch]);

  /**
   * Get the stocks from the backend.
   */
  const getStocks = () => {
    setStocksFinal(false);
    axios
      .get(baseUrl + stockListEndpointPath, {
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
        },
      })
      .then((res) => {
        setStocks(res.data.stocks);
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

  /**
   * Handle a click on one of the pagination buttons.
   *
   * @param {React.MouseEvent} _ The event.
   * @param {number} newPage The new page.
   */
  const handlePageChange = (_: React.MouseEvent, newPage: number): void => {
    setPage(newPage);
  };

  /**
   * Handle a change in the number of rows per page, triggered by the row count dropdown.
   *
   * @param {ChangeEvent<HTMLInputElement>} event The event.
   */
  const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>): void => {
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
          "refinitivESGScore",
          "refinitivEmissions",
          "spESGScore",
          "dividendYieldPercent",
        ].includes(attribute)
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
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ height: 52.5 }}>
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
              <TableCell
                sx={{
                  display: displayColumn("Country"),
                }}
              >
                <Tooltip
                  title={
                    <Typography variant="body1">The Country of the company’s operational headquarters.</Typography>
                  }
                  arrow
                >
                  <Box display="inline-block">Country</Box>
                </Tooltip>
              </TableCell>
              {/* StyleBox */}
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
                  <Tooltip
                    title={
                      <>
                        <Typography variant="body1" paddingBottom={1}>
                          The Size of a company based on its market capitalization and geographic area.
                        </Typography>
                        <Typography variant="body2">
                          Large-cap stocks are defined as the group that accounts for the top 70% of the capitalization
                          of each geographic area; mid-cap stocks represent the next 20%; and small-cap stocks represent
                          the balance.
                        </Typography>
                      </>
                    }
                    arrow
                    placement="top"
                  >
                    <Box display="inline-block">Size</Box>
                  </Tooltip>
                </TableSortLabel>
                <br />
                <TableSortLabel
                  active={sortBy === "style"}
                  direction={sortBy === "style" && sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("style")}
                >
                  <Tooltip
                    title={
                      <Typography variant="body1">
                        The Style category based on the value and growth characteristics of a company.
                      </Typography>
                    }
                    arrow
                    placement="bottom"
                  >
                    <Box display="inline-block">Style</Box>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
              {/* Sector */}
              <TableCell
                sx={{
                  display: displayColumn("Sector"),
                }}
              >
                <Tooltip
                  title={<Typography variant="body1">The general sphere in which a company does business.</Typography>}
                  arrow
                >
                  <Box display="inline-block">Sector</Box>
                </Tooltip>
              </TableCell>
              {/* Industry */}
              <TableCell
                sx={{
                  display: displayColumn("Industry"),
                }}
              >
                <Tooltip
                  title={
                    <Typography variant="body1">A more fine-grained categorization of a company’s business.</Typography>
                  }
                  arrow
                >
                  <Box display="inline-block">Industry</Box>
                </Tooltip>
              </TableCell>
              {/* Total Score */}
              <TableCell
                sx={{
                  display: displayColumn("Total Score"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "totalScore"}
                  direction={sortBy !== "totalScore" || sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("totalScore")}
                >
                  <Tooltip
                    title={
                      <>
                        <Typography variant="body1" paddingBottom={1}>
                          An overall score that combines the financial and ESG scores via equal weighting.
                        </Typography>
                        <Typography variant="body2">
                          Values range from 0 to 100, where a score of 0 indicates an average-performing company and a
                          score of 100 indicates a company with perfect overall performance.
                        </Typography>
                      </>
                    }
                    arrow
                  >
                    <Box display="inline-block">Total</Box>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
              {/* Financial Score */}
              <TableCell
                sx={{
                  display: displayColumn("Financial Score"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "financialScore"}
                  direction={sortBy !== "financialScore" || sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("financialScore")}
                >
                  <Tooltip
                    title={
                      <>
                        <Typography variant="body1" paddingBottom={1}>
                          A score that measures the financial strength of a company.
                        </Typography>
                        <Typography variant="body2">
                          Values range from 0 to 100, where a score of 0 indicates an average-performing company and a
                          score of 100 indicates a company with perfect financial performance.
                        </Typography>
                      </>
                    }
                    arrow
                  >
                    <Box display="inline-block">Financial</Box>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
              {/* ESG Score */}
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
                  <Tooltip
                    title={
                      <>
                        <Typography variant="body1" paddingBottom={1}>
                          A score that measures the environmental, social, and governance (ESG) behavior of a company.
                        </Typography>
                        <Typography variant="body2">
                          Values range from 0 to 100, where a score of 0 indicates an average-behaving company and a
                          score of 100 indicates a company with perfect ESG behavior.
                        </Typography>
                      </>
                    }
                    arrow
                  >
                    <Box display="inline-block">ESG</Box>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
              {/* Morningstar Star Rating */}
              <TableCell
                sx={{
                  display: displayColumn("Star Rating"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "starRating"}
                  direction={sortBy !== "starRating" || sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("starRating")}
                >
                  <Tooltip
                    title={
                      <>
                        <Typography variant="body1" paddingBottom={1}>
                          The Morningstar star rating is determined by a stock’s current price, Morningstar’s estimate
                          of the stock’s fair value, and the uncertainty rating of the fair value. The bigger the
                          discount, the higher the star rating.
                        </Typography>
                        <Typography variant="body2">
                          Four- and 5-star ratings mean the stock is undervalued, while a 3-star rating means it’s
                          fairly valued, and 1- and 2-star stocks are overvalued. When looking for investments, a 5-star
                          stock is generally a better opportunity than a 1-star stock.
                        </Typography>
                      </>
                    }
                    arrow
                  >
                    <Box display="inline-block">Star Rating</Box>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
              {/* Morningstar Fair Value */}
              <TableCell
                sx={{
                  display: displayColumn("Morningstar Fair Value"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "morningstarFairValue"}
                  direction={sortBy === "morningstarFairValue" && sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("morningstarFairValue")}
                >
                  <Tooltip
                    title={
                      <>
                        <Typography variant="body1" paddingBottom={1}>
                          The Morningstar Fair Value Estimate tells investors what the long-term intrinsic value of a
                          stock is. It is calculated using a proprietary model that combines the company’s financial
                          statements, analyst estimates, and other factors to determine the company’s fair value.
                        </Typography>
                        <Typography variant="body2">
                          The percentage difference between the stock’s current price and the fair value estimate
                          indicates the stock’s discount (negative percentage) or premium (positive percentage) to its
                          fair value. A stock that is trading at a discount to its fair value is considered undervalued,
                          while a stock trading at a premium to its fair value is considered overvalued.
                        </Typography>
                      </>
                    }
                    arrow
                  >
                    <Box display="inline-block">Fair Value</Box>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
              {/* Analyst Consensus */}
              <TableCell
                sx={{
                  display: displayColumn("Analyst Consensus"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "analystConsensus"}
                  direction={sortBy !== "analystConsensus" || sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("analystConsensus")}
                >
                  <Tooltip
                    title={
                      <>
                        <Typography variant="body1" paddingBottom={1}>
                          The consensus of analyst recommendations for a stock is calculated by aggregating the
                          recommendations of analysts who cover the stock and then normalizing the data to a scale of 0
                          to 10.
                        </Typography>
                        <Typography variant="body2">
                          A score of 0 indicates a strong sell recommendation, while a score of 10 indicates a strong
                          buy recommendation.
                        </Typography>
                      </>
                    }
                    arrow
                  >
                    <Box display="inline-block">Anlst Consns</Box>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
              {/* Analyst Target Price */}
              <TableCell
                sx={{
                  display: displayColumn("Analyst Target Price"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "analystTargetPrice"}
                  direction={sortBy === "analystTargetPrice" && sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("analystTargetPrice")}
                >
                  <Tooltip
                    title={
                      <>
                        <Typography variant="body1" paddingBottom={1}>
                          The average analyst target price is the average of the estimated price targets of analysts who
                          cover a stock.
                        </Typography>
                        <Typography variant="body2">
                          The percentage difference between the stock’s current price and the average analyst target
                          price indicates the stock’s discount (negative percentage) or premium (positive percentage) to
                          its average analyst target price. A stock that is trading at a discount to its average analyst
                          target price is considered undervalued, while a stock trading at a premium to its average
                          analyst target price is considered overvalued.
                        </Typography>
                      </>
                    }
                    arrow
                  >
                    <Box display="inline-block">Analyst Target</Box>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
              {/* MSCI ESG Rating */}
              <TableCell
                sx={{
                  display: displayColumn("MSCI ESG Rating"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "msciESGRating"}
                  direction={sortBy === "msciESGRating" && sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("msciESGRating")}
                >
                  <Tooltip
                    title={
                      <>
                        <Typography variant="body1" paddingBottom={1}>
                          The MSCI ESG Rating aims to measure a company’s management of financially relevant ESG risks
                          and opportunities. MSCI uses a rules-based methodology to identify industry leaders and
                          laggards according to their exposure to ESG risks and how well they manage those risks
                          relative to peers.
                        </Typography>
                        <Typography variant="body2">
                          The ESG Ratings range from leader (AAA, AA), average (A, BBB, BB) to laggard (B, CCC).
                        </Typography>
                      </>
                    }
                    arrow
                  >
                    <Box display="inline-block">MSCI ESG</Box>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
              {/* MSCI Implied Temperature Rise */}
              <TableCell
                sx={{
                  display: displayColumn("MSCI Implied Temperature Rise"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "msciTemperature"}
                  direction={sortBy === "msciTemperature" && sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("msciTemperature")}
                >
                  <Tooltip
                    title={
                      <Typography variant="body1">
                        The MSCI Implied Temperature Rise is a forward-looking metric designed to show the temperature
                        alignment of a company with global temperature goals.
                      </Typography>
                    }
                    arrow
                  >
                    <Box display="inline-block">MSCI Temp</Box>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
              {/* Refinitiv */}
              <TableCell
                sx={{
                  display: displayColumn("Refinitiv ESG Information"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "refinitivESGScore"}
                  direction={sortBy !== "refinitivESGScore" || sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("refinitivESGScore")}
                >
                  <Tooltip
                    title={
                      <>
                        <Typography variant="body1" paddingBottom={1}>
                          The Refinitiv ESG score measures a company’s ESG performance based on verifiable reported data
                          in the public domain.
                        </Typography>
                        <Typography variant="body2">
                          Its values range from 0 to 100, with 0 being the lowest, indicating a poor ESG performance,
                          and 100 being the highest, indicating an excellent ESG performance.
                        </Typography>
                      </>
                    }
                    arrow
                    placement="top"
                  >
                    <Box display="inline-block">Refinitiv </Box>
                  </Tooltip>
                </TableSortLabel>
                <br />
                <TableSortLabel
                  active={sortBy === "refinitivEmissions"}
                  direction={sortBy !== "refinitivEmissions" || sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("refinitivEmissions")}
                  sx={{ flexDirection: "row-reverse" }}
                >
                  <Tooltip
                    title={
                      <>
                        <Typography variant="body1" paddingBottom={1}>
                          The Refinitiv emission reduction score measures a company’s commitment and effectiveness
                          towards reducing environmental emissions in its production and operational processes.
                        </Typography>
                        <Typography variant="body2">
                          Its values range from 0 to 100, with 0 being the lowest, indicating poor emission reduction
                          efforts, and 100 being the highest, indicating excellent emission reduction efforts.
                        </Typography>
                      </>
                    }
                    arrow
                    placement="bottom"
                  >
                    <Box display="inline-block">Emissions</Box>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
              {/* S&P ESG Score */}
              <TableCell
                sx={{
                  display: displayColumn("S&P ESG Score"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "spESGScore"}
                  direction={sortBy !== "spESGScore" || sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("spESGScore")}
                >
                  <Tooltip
                    title={
                      <>
                        <Typography variant="body1" paddingBottom={1}>
                          The S&P Global ESG Score measures a companies’ exposure to and performance on key ESG risks
                          and opportunities, the quality and completeness of their public disclosures, and their
                          awareness of emerging but underreported ESG issues.
                        </Typography>
                        <Typography variant="body2">
                          Its values range from 0 to 100, with 0 being the lowest, indicating a poor ESG performance,
                          and 100 being the highest, indicating an excellent ESG performance.
                        </Typography>
                      </>
                    }
                    arrow
                  >
                    <Box display="inline-block">S&P</Box>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
              {/* Sustainalytics ESG Risk */}
              <TableCell
                sx={{
                  display: displayColumn("Sustainalytics ESG Risk"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "sustainalyticsESGRisk"}
                  direction={sortBy === "sustainalyticsESGRisk" && sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("sustainalyticsESGRisk")}
                >
                  <Tooltip
                    title={
                      <>
                        <Typography variant="body1" paddingBottom={1}>
                          The Sustainalytics ESG Risk Rating measures the degree to which a company’s economic value is
                          at risk driven by ESG factors.
                        </Typography>
                        <Typography variant="body2">
                          Its values are distributed across five categories, where values below 10 indicate a negligible
                          risk, and values above 40 indicate a severe risk.
                        </Typography>
                      </>
                    }
                    arrow
                  >
                    <Box display="inline-block">Sustain-alytics</Box>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
              {/* 52 Week Range */}
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
                  <Tooltip
                    title={
                      <Typography variant="body1">
                        This range represents the lowest and highest price at which the stock has traded in the last 52
                        weeks, as well as the last price at the end of a trading day.
                      </Typography>
                    }
                    arrow
                  >
                    <Box display="inline-block">52W Range</Box>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
              {/* Dividend Yield */}
              <TableCell
                sx={{
                  display: displayColumn("Dividend Yield (%)"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "dividendYieldPercent"}
                  direction={sortBy !== "dividendYieldPercent" || sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("dividendYieldPercent")}
                >
                  <Tooltip
                    title={
                      <Typography variant="body1">
                        The annual dividend per share divided by the current stock price.
                      </Typography>
                    }
                    arrow
                  >
                    <Box display="inline-block">Div Yield</Box>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
              {/* P/E Ratio */}
              <TableCell
                sx={{
                  display: displayColumn("P / E Ratio"),
                }}
              >
                <TableSortLabel
                  active={sortBy === "priceEarningRatio"}
                  direction={sortBy === "priceEarningRatio" && sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("priceEarningRatio")}
                >
                  <Tooltip
                    title={
                      <Typography variant="body1">
                        The company’s current market capitalization divided by its earnings.
                      </Typography>
                    }
                    arrow
                  >
                    <Box display="inline-block">P/E</Box>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
              {/* Market Cap */}
              <TableCell
                sx={{
                  display: displayColumn("Market Capitalization"),
                }}
              >
                <Tooltip
                  title={
                    <Typography variant="body1">
                      The current price of a stock multiplied by the number of all its shares.
                    </Typography>
                  }
                  arrow
                >
                  <Box display="inline-block">Market Cap</Box>
                </Tooltip>
              </TableCell>
              {/* Actions */}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stocksFinal
              ? stocks.map(
                  (
                    stock // Render stock rows
                  ) => <StockRow stock={stock} getStocks={getStocks} key={stock.ticker} columns={props.columns} />
                )
              : [...Array(rowsPerPage > 0 ? rowsPerPage : 100)].map(
                  (
                    _undef,
                    key // Render skeleton rows
                  ) => <StockRow key={key} getStocks={getStocks} columns={props.columns} />
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

/**
 * Properties for the StocksTable component.
 */
interface StocksTableProps {
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
}

export default StocksTable;
