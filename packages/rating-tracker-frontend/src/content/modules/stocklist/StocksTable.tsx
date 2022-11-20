import { FC, ChangeEvent, useState, useEffect } from "react";
import axios from "axios";
import {
  // IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableContainer,
  TableSortLabel,
} from "@mui/material";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
import { Stock } from "../../../models/stock";
import { baseUrl, stockAPI, stockListEndpoint } from "../../../endpoints";
import {
  Country,
  Industry,
  Size,
  SortableAttribute,
  Style,
} from "../../../types";
import StockRow from "./StockRow";
import NotificationSnackbar from "../../../components/NotificationSnackbar";
import useNotification from "../../../helpers/useNotification";

const StocksTable: FC<StocksTableProps> = (props: StocksTableProps) => {
  const [page, setPage] = useState<number>(0);
  const [count, setCount] = useState<number>(-1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stocksFinal, setStocksFinal] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortableAttribute>("name");
  const [sortDesc, setSortDesc] = useState<boolean>(false);
  const { setNotification } = useNotification();

  useEffect(() => {
    getStocks();
  }, [page, rowsPerPage, sortBy, sortDesc, props.filter]);

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
        setStocks(res.data.stocks.map((rawStock) => new Stock(rawStock)));
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
      setSortDesc(attribute === "size");
    }
  };

  return (
    <>
      <NotificationSnackbar
        snackbarProps={{
          anchorOrigin: { horizontal: "center", vertical: "bottom" },
        }}
      />
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
                  active={sortBy === "starRating"}
                  direction={
                    sortBy === "starRating" && sortDesc ? "desc" : "asc"
                  }
                  onClick={handleSortLabelClicked("starRating")}
                >
                  Star Rating
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "dividendYieldPercent"}
                  direction={
                    sortBy === "dividendYieldPercent" && sortDesc
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
              {/* <TableCell align="right">Actions</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {stocksFinal
              ? stocks.map((stock) => (
                  <StockRow stock={stock} key={stock.ticker} />
                ))
              : [...Array(rowsPerPage > 0 ? rowsPerPage : 100)].map(
                  (_undef, key) => <StockRow key={key} />
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
        rowsPerPageOptions={[5, 10, 25, 50, { label: "All", value: -1 }]}
        showFirstButton
        showLastButton
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
  // stocks?: string[];
  filter: StockFilter;
}

export default StocksTable;
