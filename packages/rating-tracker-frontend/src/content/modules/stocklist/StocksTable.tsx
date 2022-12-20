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
import { Stock } from "rating-tracker-commons";
import { baseUrl, stockAPI, stockListEndpoint } from "../../../endpoints";
import {
  Country,
  Industry,
  Size,
  SortableAttribute,
  Style,
} from "rating-tracker-commons";
import StockRow from "./StockRow";
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
          name: props.filter.name ? props.filter.name : undefined,
          size: props.filter.size,
          style: props.filter.style,
          country:
            props.filter.countries?.length > 0
              ? props.filter.countries.join(",")
              : undefined,
          industry:
            props.filter.industries?.length > 0
              ? props.filter.industries.join(",")
              : undefined,
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

  return (
    <>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "name"}
                  direction={sortBy === "name" && sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("name")}
                >
                  Stock
                </TableSortLabel>
              </TableCell>
              <TableCell>Country</TableCell>
              <TableCell>
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
              <TableCell>Sector</TableCell>
              <TableCell>Industry</TableCell>
              <TableCell>
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
              <TableCell>
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
              <TableCell>
                <TableSortLabel
                  active={sortBy === "esgScore"}
                  direction={sortBy !== "esgScore" || sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("esgScore")}
                >
                  ESG
                </TableSortLabel>
              </TableCell>
              <TableCell>
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
              <TableCell>
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
              <TableCell>
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
              <TableCell>
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
              <TableCell>
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
              <TableCell>
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
              <TableCell>
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
              <TableCell>
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
              <TableCell>
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
              <TableCell>
                <TableSortLabel
                  active={sortBy === "52w"}
                  direction={sortBy === "52w" && sortDesc ? "desc" : "asc"}
                  onClick={handleSortLabelClicked("52w")}
                >
                  52W Range
                </TableSortLabel>
              </TableCell>
              <TableCell>
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
              <TableCell>
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
              <TableCell>Market Cap</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stocksFinal
              ? stocks.map((stock) => (
                  <StockRow
                    stock={stock}
                    getStocks={getStocks}
                    key={stock.ticker}
                  />
                ))
              : [...Array(rowsPerPage > 0 ? rowsPerPage : 100)].map(
                  (_undef, key) => <StockRow getStocks={getStocks} key={key} />
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
  name?: string;
  size?: Size;
  style?: Style;
  countries?: Country[];
  industries?: Industry[];
}

interface StocksTableProps {
  filter: StockFilter;
  triggerRefetch?: boolean;
}

export default StocksTable;
