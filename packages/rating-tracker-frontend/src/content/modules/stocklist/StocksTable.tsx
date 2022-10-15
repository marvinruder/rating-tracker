import { FC, ChangeEvent, useState, useEffect } from "react";
import axios from "axios";
import {
  Tooltip,
  // IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableContainer,
  Typography,
  useTheme,
  Snackbar,
  Alert,
  Slide,
  TableSortLabel,
  Skeleton,
} from "@mui/material";
// import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
// import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import { Stock } from "src/models/stock";
import { getRegionFromCountry } from "src/enums/regions/region";
import { getSuperRegionFromCountry } from "src/enums/regions/superregion";
import { getSectorFromIndustry } from "src/enums/sectors/sector";
import { getSuperSectorFromIndustry } from "src/enums/sectors/superSector";
import { getGroupFromIndustry } from "src/enums/sectors/industryGroup";
import { Size } from "src/enums/size";
import { Style } from "src/enums/style";
import StyleBox from "src/components/StyleBox";
import SectorIcon from "src/components/SectorIcon";
import { Country, emojiFlag, getCountryCode } from "src/enums/regions/country";
import { baseUrl, stockAPI, stockListEndpoint } from "src/endpoints";
import { SortableAttribute } from "src/types";
import { getIndustryKey, Industry } from "src/enums/sectors/industry";
import StarRating from "src/components/StarRating/index";

const StocksTable: FC<StocksTableProps> = (props: StocksTableProps) => {
  const [page, setPage] = useState<number>(0);
  const [count, setCount] = useState<number>(-1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stocksFinal, setStocksFinal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortableAttribute>("name");
  const [sortDesc, setSortDesc] = useState<boolean>(false);

  useEffect(() => {
    getStocks();
  }, []);

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
              ? props.filter.countries
                  .map((country) => getCountryCode(country))
                  .join(",")
              : undefined,
          industry:
            props.filter.industries?.length > 0
              ? props.filter.industries
                  .map((industry) => getIndustryKey(industry))
                  .join(",")
              : undefined,
        },
      })
      .then((res) => {
        setStocks(res.data.stocks.map((rawStock) => new Stock(rawStock)));
        setCount(res.data.count);
      })
      .catch((e) => {
        console.error(e);
        try {
          setErrorMessage(
            `${e.response.status} ${e.response.statusText}: ${e.response.data.message}`
          );
        } catch {
          setErrorMessage(e.message);
        }
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

  const theme = useTheme();

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
              ? stocks.map((stock) => {
                  return (
                    <TableRow hover key={stock.ticker}>
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          width={160}
                          noWrap
                        >
                          {stock.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          width={160}
                          noWrap
                        >
                          {stock.ticker}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          width={125}
                          noWrap
                        >
                          {stock.country &&
                            emojiFlag(stock.country) + " " + stock.country}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          width={125}
                          noWrap
                        >
                          {stock.country && getRegionFromCountry(stock.country)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          width={125}
                          noWrap
                        >
                          {stock.country &&
                            getSuperRegionFromCountry(stock.country)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={
                            stock.size != undefined && stock.style != undefined
                              ? `${Size[stock.size]}-${Style[stock.style]}`
                              : undefined
                          }
                          arrow
                        >
                          <div
                            style={{
                              width:
                                2.75 *
                                (theme.typography.body1.fontSize as number),
                            }}
                          >
                            <StyleBox
                              fill={theme.colors.alpha.black[100]}
                              stroke={theme.colors.alpha.black[100]}
                              size={stock.size}
                              style={stock.style}
                              length={
                                2.75 *
                                (theme.typography.body1.fontSize as number)
                              }
                            />
                          </div>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {stock.industry && (
                            <SectorIcon
                              industry={stock.industry}
                              length={
                                1.75 *
                                (theme.typography.body1.fontSize as number)
                              }
                              type={"Sector"}
                            />
                          )}
                          <span style={{ width: 6 }} />
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            width={105}
                            noWrap
                          >
                            {stock.industry &&
                              getSectorFromIndustry(stock.industry)}
                          </Typography>
                        </span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {stock.industry && (
                            <SectorIcon
                              industry={stock.industry}
                              length={
                                1.75 *
                                (theme.typography.body2.fontSize as number)
                              }
                              type={"SuperSector"}
                            />
                          )}
                          <span style={{ width: 6 }} />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            width={105}
                            noWrap
                          >
                            {stock.industry &&
                              getSuperSectorFromIndustry(stock.industry)}
                          </Typography>
                        </span>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                          width={150}
                          noWrap
                        >
                          {stock.industry && stock.industry}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          width={150}
                          noWrap
                        >
                          {stock.industry &&
                            getGroupFromIndustry(stock.industry)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StarRating value={stock.starRating} />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          color="text.primary"
                          width={45}
                          noWrap
                        >
                          {stock.dividendYieldPercent ?? "–"}
                          {" %"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          color="text.primary"
                          width={45}
                          noWrap
                        >
                          {stock.priceEarningRatio ?? "–"}
                        </Typography>
                      </TableCell>
                      {/* <TableCell align="right">
                        <Tooltip title="Edit Order" arrow>
                          <IconButton
                            sx={{
                              "&:hover": {
                                background: theme.colors.primary.lighter,
                              },
                              color: theme.palette.primary.main,
                            }}
                            color="inherit"
                            size="small"
                          >
                            <EditTwoToneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Order" arrow>
                          <IconButton
                            sx={{
                              "&:hover": {
                                background: theme.colors.error.lighter,
                              },
                              color: theme.palette.error.main,
                            }}
                            color="inherit"
                            size="small"
                          >
                            <DeleteTwoToneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell> */}
                    </TableRow>
                  );
                })
              : [...Array(rowsPerPage > 0 ? rowsPerPage : 100)].map(
                  (_undef, key) => {
                    return (
                      <TableRow hover key={key}>
                        <TableCell>
                          <Typography variant="body1">
                            <Skeleton width={160} />
                          </Typography>
                          <Typography variant="body2">
                            <Skeleton width={160} />
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">
                            <Skeleton width={125} />
                          </Typography>
                          <Typography variant="body2">
                            <Skeleton width={125} />
                          </Typography>
                          <Typography variant="body2">
                            <Skeleton width={125} />
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Skeleton
                            variant="rectangular"
                            width={
                              2.75 * (theme.typography.body1.fontSize as number)
                            }
                            height={
                              2.75 * (theme.typography.body1.fontSize as number)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">
                            <Skeleton width={132} />
                          </Typography>
                          <Typography variant="body2">
                            <Skeleton width={132} />
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">
                            <Skeleton width={150} />
                          </Typography>
                          <Typography variant="body2">
                            <Skeleton width={150} />
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {[...Array(5).keys()].map((index) => {
                            return (
                              <Skeleton
                                key={index}
                                sx={{ m: "2px", display: "inline-block" }}
                                variant="circular"
                                width={20}
                                height={20}
                              />
                            );
                          })}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">
                            <Skeleton width={45} />
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">
                            <Skeleton width={45} />
                          </Typography>
                        </TableCell>
                        {/* <TableCell align="right">
                          <Skeleton
                            sx={{ m: "2px", display: "inline-block" }}
                            variant="circular"
                            width={
                              2 * (theme.typography.body1.fontSize as number) -
                              4
                            }
                            height={
                              2 * (theme.typography.body1.fontSize as number) -
                              4
                            }
                          />
                          <Skeleton
                            sx={{ m: "2px", display: "inline-block" }}
                            variant="circular"
                            width={
                              2 * (theme.typography.body1.fontSize as number) -
                              4
                            }
                            height={
                              2 * (theme.typography.body1.fontSize as number) -
                              4
                            }
                          />
                        </TableCell> */}
                      </TableRow>
                    );
                  }
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
      <Snackbar
        open={errorMessage.length > 0}
        onClose={() => setErrorMessage("")}
        TransitionComponent={(props) => <Slide {...props} direction="up" />}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      >
        <Alert
          onClose={() => setErrorMessage("")}
          severity="error"
          sx={{ width: "100%" }}
          variant={"filled"}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
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
