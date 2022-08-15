import { FC, ChangeEvent, useState } from "react";
import PropTypes from "prop-types";
import {
  Tooltip,
  Divider,
  Box,
  Card,
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableContainer,
  Typography,
  useTheme,
  CardHeader,
} from "@mui/material";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import { Stock } from "src/models/stock";
import { getRegionFromCountry } from "src/enums/regions/region";
import { getSuperRegionFromCountry } from "src/enums/regions/superregion";
import { emojiFlag } from "src/helpers/flags";
import { getCountryCode } from "src/enums/regions/country";
import { getSectorFromIndustry, getSectorKey } from "src/enums/sectors/sector";
import {
  getSuperSectorFromIndustry,
  getSuperSectorKey,
} from "src/enums/sectors/superSector";
import { getGroupFromIndustry } from "src/enums/sectors/industryGroup";
import IconTypography from "src/components/IconTypography";

interface StocksTableProps {
  className?: string;
  stocks: Stock[];
}

const applyPagination = (
  stocks: Stock[],
  page: number,
  rowsPerPage: number
): Stock[] => {
  return rowsPerPage > 0
    ? stocks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : stocks;
};

const RecentOrdersTable: FC<StocksTableProps> = ({ stocks: stocks }) => {
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const handleSelectAllStocks = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setSelectedStocks(
      event.target.checked ? stocks.map((stock) => stock.ticker) : []
    );
  };

  const handleSelectOneStock = (
    event: ChangeEvent<HTMLInputElement>,
    stockTicker: string
  ): void => {
    if (!selectedStocks.includes(stockTicker)) {
      setSelectedStocks((prevSelected) => [...prevSelected, stockTicker]);
    } else {
      setSelectedStocks((prevSelected) =>
        prevSelected.filter((ticker) => ticker !== stockTicker)
      );
    }
  };

  const handlePageChange = (event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setRowsPerPage(parseInt(event.target.value));
  };

  const paginatedStocks = applyPagination(stocks, page, rowsPerPage);
  const selectedSomeStocks =
    selectedStocks.length > 0 && selectedStocks.length < stocks.length;
  const selectedAllStocks = selectedStocks.length === stocks.length;
  const theme = useTheme();

  return (
    <Card>
      <CardHeader title="Recent Orders" />
      <Divider />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={selectedAllStocks}
                  indeterminate={selectedSomeStocks}
                  onChange={handleSelectAllStocks}
                />
              </TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Sector</TableCell>
              <TableCell>Industry</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStocks.map((stock) => {
              const isStockSelected = selectedStocks.includes(stock.ticker);
              return (
                <TableRow hover key={stock.ticker} selected={isStockSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isStockSelected}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        handleSelectOneStock(event, stock.ticker)
                      }
                      value={isStockSelected}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="text.primary"
                      maxWidth={200}
                      gutterBottom
                      noWrap
                    >
                      {stock.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {stock.ticker}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="text.primary"
                      gutterBottom
                      noWrap
                    >
                      {emojiFlag(getCountryCode(stock.country)) +
                        " " +
                        stock.country}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {getRegionFromCountry(stock.country)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {getSuperRegionFromCountry(stock.country)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconTypography
                      variant="body1"
                      fontWeight="bold"
                      color="text.primary"
                      imageUrl={`/static/images/sector/${getSectorKey(
                        getSectorFromIndustry(stock.industry)
                      )}.svg`}
                      gutterBottom
                      noWrap
                    >
                      {getSectorFromIndustry(stock.industry)}
                    </IconTypography>
                    <IconTypography
                      variant="body2"
                      color="text.secondary"
                      imageUrl={`/static/images/supersector/${getSuperSectorKey(
                        getSuperSectorFromIndustry(stock.industry)
                      )}.svg`}
                      noWrap
                    >
                      {getSuperSectorFromIndustry(stock.industry)}
                    </IconTypography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="text.primary"
                      gutterBottom
                      noWrap
                    >
                      {stock.industry}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {getGroupFromIndustry(stock.industry)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
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
                          "&:hover": { background: theme.colors.error.lighter },
                          color: theme.palette.error.main,
                        }}
                        color="inherit"
                        size="small"
                      >
                        <DeleteTwoToneIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box p={2}>
        <TablePagination
          component="div"
          count={stocks.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50, { label: "All", value: -1 }]}
        />
      </Box>
    </Card>
  );
};

RecentOrdersTable.propTypes = {
  stocks: PropTypes.array.isRequired,
};

RecentOrdersTable.defaultProps = {
  stocks: [],
};

export default RecentOrdersTable;
