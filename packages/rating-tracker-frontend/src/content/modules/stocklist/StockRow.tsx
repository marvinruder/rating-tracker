import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Skeleton,
  Slider,
  styled,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import SectorIcon from "../../../components/SectorIcon";
import StarRating from "../../../components/StarRating";
import StyleBox from "../../../components/StyleBox";
import {
  Country,
  countryArray,
  countryName,
  countryNameWithFlag,
  groupOfIndustry,
  industryGroupName,
  industryName,
  isCountry,
  regionName,
  regionOfCountry,
  sectorName,
  sectorOfIndustryGroup,
  Stock,
  superSectorName,
  superSectorOfSector,
} from "rating-tracker-commons";
import axios from "axios";
import {
  baseUrl,
  fetchAPI,
  morningstarEndpoint,
  stockAPI,
} from "../../../endpoints";
import useNotification from "../../../helpers/useNotification";
import { useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";

const Range52WSlider = styled(Slider)(({ theme }) => ({
  // height: 2,
  // padding: "15px 0",
  // "& .MuiSlider-thumb": {
  //   height: 28,
  //   width: 28,
  //   backgroundColor: "#fff",
  //   boxShadow: iOSBoxShadow,
  //   "&:focus, &:hover, &.Mui-active": {
  //     boxShadow:
  //       "0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)",
  //     // Reset on touch devices, it doesn't add specificity
  //     "@media (hover: none)": {
  //       boxShadow: iOSBoxShadow,
  //     },
  //   },
  // },
  "& .MuiSlider-valueLabel": {
    fontSize: theme.typography.body2.fontSize,
    top: 0,
    backgroundColor: "unset",
    color: theme.palette.text.primary,
  },
  "& .MuiSlider-mark": {
    display: "none",
  },
  "& .MuiSlider-markLabel": {
    top: 18,
    transform: "translateX(-100%)",
    "&Active": {
      transform: "translateX(0%)",
    },
  },
}));

const StockRow = (props: StockRowProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [name, setName] = useState<string>(props.stock?.name);
  const [nameError, setNameError] = useState<boolean>(false);
  const [country, setCountry] = useState<Country>(props.stock?.country);
  const [countryError, setCountryError] = useState<boolean>(false);
  const [countryInputValue, setCountryInputValue] = useState<string>(
    countryName[props.stock?.country]
  );
  const [morningstarId, setMorningstarId] = useState<string>(
    props.stock?.morningstarId
  );
  const [morningstarIdRequestInProgress, setMorningstarIdRequestInProgress] =
    useState<boolean>(false);
  const theme = useTheme();
  const { setNotification } = useNotification();

  const validate = () => {
    setNameError(!name);
    setCountryError(!country);
  };

  const updateStock = () => {
    props.stock &&
      props.getStocks &&
      (setRequestInProgress(true),
      axios
        .patch(baseUrl + stockAPI + `/${props.stock.ticker}`, undefined, {
          params: {
            name: name !== props.stock.name ? name : undefined,
            country: country !== props.stock.country ? country : undefined,
            morningstarId:
              morningstarId !== props.stock.morningstarId
                ? morningstarId
                : undefined,
          },
        })
        .then(props.getStocks)
        .catch((e) => {
          setNotification({
            severity: "error",
            title: "Error while updating stock",
            message:
              e.response?.status && e.response?.data?.message
                ? `${e.response.status}: ${e.response.data.message}`
                : e.message ?? "No additional information available.",
          });
        })
        .finally(() => setRequestInProgress(false)));
  };

  const patchStockMorningstarId = () => {
    props.stock &&
      props.getStocks &&
      (setMorningstarIdRequestInProgress(true),
      axios
        .patch(baseUrl + stockAPI + `/${props.stock.ticker}`, undefined, {
          params: { morningstarId: morningstarId },
        })
        .then(() => {
          if (morningstarId) {
            axios
              .get(baseUrl + fetchAPI + morningstarEndpoint, {
                params: { ticker: props.stock.ticker, noSkip: true },
              })
              .then(() => {})
              .catch((e) => {
                setNotification({
                  severity: "error",
                  title: "Error while fetching information from Morningstar",
                  message:
                    e.response?.status && e.response?.data?.message
                      ? `${e.response.status}: ${e.response.data.message}`
                      : e.message ?? "No additional information available.",
                });
              })
              .finally(() => setMorningstarIdRequestInProgress(false));
          } else {
            setMorningstarIdRequestInProgress(false);
          }
        })
        .catch((e) => {
          setMorningstarIdRequestInProgress(false);
          setNotification({
            severity: "error",
            title: "Error while adding Morningstar ID",
            message:
              e.response?.status && e.response?.data?.message
                ? `${e.response.status}: ${e.response.data.message}`
                : e.message ?? "No additional information available.",
          });
        }));
  };

  const deleteStock = () => {
    props.stock &&
      props.getStocks &&
      (setRequestInProgress(true),
      axios
        .delete(baseUrl + stockAPI + `/${props.stock.ticker}`)
        .then(props.getStocks)
        .catch((e) => {
          setNotification({
            severity: "error",
            title: "Error while deleting stock",
            message:
              e.response?.status && e.response?.data?.message
                ? `${e.response.status}: ${e.response.data.message}`
                : e.message ?? "No additional information available.",
          });
        })
        .finally(() => setRequestInProgress(false)));
  };

  const formatMarketCap = () => {
    if (props.stock.marketCap > 1e12) {
      return (props.stock.marketCap / 1e12).toPrecision(3) + " T";
    } else if (props.stock.marketCap > 1e9) {
      return (props.stock.marketCap / 1e9).toPrecision(3) + " B";
    } else if (props.stock.marketCap > 1e6) {
      return (props.stock.marketCap / 1e6).toPrecision(3) + " M";
    } else if (props.stock.marketCap > 1e3) {
      return (props.stock.marketCap / 1e3).toPrecision(3) + " k";
    } else {
      return props.stock.marketCap.toPrecision(3);
    }
  };

  return props.stock ? (
    <TableRow hover sx={{ height: 59 }}>
      <TableCell>
        <Typography
          variant="body1"
          fontWeight="bold"
          color="text.primary"
          width={160}
          noWrap
        >
          {props.stock.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" width={160} noWrap>
          {props.stock.ticker}
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
          {props.stock.country && countryNameWithFlag[props.stock.country]}
        </Typography>
        <Typography variant="body2" color="text.secondary" width={125} noWrap>
          {props.stock.country &&
            regionName[regionOfCountry[props.stock.country]]}
        </Typography>
      </TableCell>
      <TableCell>
        <Tooltip
          title={
            props.stock.size && props.stock.style
              ? `${props.stock.size}-${props.stock.style}`
              : undefined
          }
          arrow
        >
          <div
            style={{
              width: 2.75 * (theme.typography.body1.fontSize as number),
            }}
          >
            <StyleBox
              fill={theme.colors.alpha.black[100]}
              stroke={theme.colors.alpha.black[100]}
              size={props.stock.size}
              style={props.stock.style}
              length={2.75 * (theme.typography.body1.fontSize as number)}
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
          {props.stock.industry && (
            <SectorIcon
              industry={props.stock.industry}
              length={1.75 * (theme.typography.body1.fontSize as number)}
              type={"Sector"}
            />
          )}
          <span style={{ width: 6 }} />
          <Typography variant="body1" fontWeight="bold" width={105} noWrap>
            {props.stock.industry &&
              sectorName[
                sectorOfIndustryGroup[groupOfIndustry[props.stock.industry]]
              ]}
          </Typography>
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {props.stock.industry && (
            <SectorIcon
              industry={props.stock.industry}
              length={1.75 * (theme.typography.body2.fontSize as number)}
              type={"SuperSector"}
            />
          )}
          <span style={{ width: 6 }} />
          <Typography variant="body2" color="text.secondary" width={105} noWrap>
            {props.stock.industry &&
              superSectorName[
                superSectorOfSector[
                  sectorOfIndustryGroup[groupOfIndustry[props.stock.industry]]
                ]
              ]}
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
          {props.stock.industry && industryName[props.stock.industry]}
        </Typography>
        <Typography variant="body2" color="text.secondary" width={150} noWrap>
          {props.stock.industry &&
            industryGroupName[groupOfIndustry[props.stock.industry]]}
        </Typography>
      </TableCell>
      <TableCell>
        <StarRating value={props.stock.starRating} />
      </TableCell>
      <TableCell>
        <Typography
          variant="body1"
          fontWeight="bold"
          color="text.primary"
          width={90}
          noWrap
        >
          <span style={{ float: "left" }}>{props.stock.currency ?? ""}</span>
          <span style={{ float: "right" }}>
            {props.stock.morningstarFairValue?.toFixed(2) ?? "–"}
          </span>
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          width={90}
          sx={{ textAlign: "right" }}
          noWrap
        >
          {props.stock.morningstarFairValue &&
            props.stock.lastClose &&
            `${
              props.stock.lastClose > props.stock.morningstarFairValue
                ? "+"
                : ""
            }${Math.round(
              100 *
                (props.stock.lastClose / props.stock.morningstarFairValue - 1)
            )} %`}
        </Typography>
      </TableCell>
      <TableCell>
        {props.stock.lastClose && props.stock.low52w && props.stock.high52w && (
          <Range52WSlider
            size="small"
            sx={{
              mb: `${-0.5 * (theme.typography.body2.fontSize as number)}px`,
              mt: `${0.5 * (theme.typography.body2.fontSize as number)}px`,
              width: 150,
            }}
            value={props.stock.lastClose}
            min={props.stock.low52w}
            max={props.stock.high52w}
            marks={[
              { value: props.stock.low52w, label: props.stock.low52w },
              { value: props.stock.high52w, label: props.stock.high52w },
            ]}
            valueLabelDisplay="on"
            disabled
          />
        )}
      </TableCell>
      <TableCell>
        <Typography
          variant="body1"
          color="text.primary"
          width={45}
          sx={{ textAlign: "right" }}
          noWrap
        >
          {props.stock.dividendYieldPercent ?? "–"}
          {" %"}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body1"
          color="text.primary"
          width={45}
          sx={{ textAlign: "right" }}
          noWrap
        >
          {props.stock.priceEarningRatio ?? "–"}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body1" color="text.primary" width={75} noWrap>
          <span style={{ float: "left" }}>{props.stock.currency ?? ""}</span>
          <span style={{ float: "right" }}>
            {props.stock.marketCap ? formatMarketCap() : "–"}
          </span>
        </Typography>
      </TableCell>
      {props.getStocks && (
        <TableCell align="right">
          <Tooltip title="Edit Stock" arrow>
            <IconButton
              color="primary"
              size="small"
              onClick={() => setEditDialogOpen(true)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Stock" arrow>
            <IconButton
              color="error"
              size="small"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      )}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          <Typography variant="h3">
            Delete Stock “{props.stock.name}”
          </Typography>
        </DialogTitle>
        <DialogContent>
          Do you really want to delete the Stock “{props.stock.name}” (
          {props.stock.ticker})? This action cannot be reversed.
        </DialogContent>
        <DialogActions sx={{ p: 2.6666, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <LoadingButton
            loading={requestInProgress}
            variant="contained"
            onClick={deleteStock}
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete “{props.stock.ticker}”
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={editDialogOpen}
        onClose={() => (
          setEditDialogOpen(false), props.getStocks && props.getStocks()
        )}
      >
        <DialogTitle>
          <Typography variant="h3">Edit Stock “{props.stock.name}”</Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1} mt={0} maxWidth={500} alignItems="center">
            <Grid item xs={12}>
              <TextField
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError(false);
                }}
                error={nameError}
                label="Stock name"
                value={name}
                placeholder={"e.g. Apple Inc."}
                sx={{ maxWidth: "300px" }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                sx={{ maxWidth: "300px" }}
                options={countryArray}
                autoHighlight
                getOptionLabel={(option) => countryNameWithFlag[option]}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    {countryNameWithFlag[option]}
                  </Box>
                )}
                inputValue={countryInputValue}
                onInputChange={(_, value) => setCountryInputValue(value)}
                multiple={false}
                value={country ?? null}
                onChange={(_, value) =>
                  isCountry(value) &&
                  (setCountry(value), setCountryError(false))
                }
                filterOptions={(options) =>
                  options.filter((option) =>
                    countryName[option]
                      .toUpperCase()
                      .startsWith(countryInputValue?.trim().toUpperCase())
                  )
                }
                disableClearable
                renderInput={(params) => (
                  <TextField {...params} label="Country" error={countryError} />
                )}
              />
            </Grid>
            <Grid item xs={12} container spacing={1} alignItems="center">
              <Grid item xs={7.5}>
                <TextField
                  onChange={(event) => {
                    setMorningstarId(event.target.value);
                  }}
                  label="Morningstar ID"
                  value={morningstarId}
                  placeholder={"e.g. 0P000000GY"}
                  sx={{ maxWidth: "300px" }}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <LoadingButton
                  size="small"
                  loading={morningstarIdRequestInProgress}
                  onClick={patchStockMorningstarId}
                  disabled={requestInProgress}
                  variant="contained"
                  startIcon={<PublishedWithChangesIcon />}
                >
                  {"Update and fetch"}
                </LoadingButton>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.6666, pt: 0 }}>
          <Button
            onClick={() => (
              setEditDialogOpen(false), props.getStocks && props.getStocks()
            )}
          >
            Cancel
          </Button>
          <LoadingButton
            loading={requestInProgress}
            variant="contained"
            onClick={updateStock}
            onMouseOver={validate}
            disabled={nameError || countryError}
            startIcon={<PublishedWithChangesIcon />}
          >
            Update Stock
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </TableRow>
  ) : (
    <TableRow hover>
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
      </TableCell>
      <TableCell>
        <Skeleton
          variant="rectangular"
          width={2.75 * (theme.typography.body1.fontSize as number)}
          height={2.75 * (theme.typography.body1.fontSize as number)}
        />
      </TableCell>
      <TableCell>
        <Typography variant="body1" display={"flex"}>
          <Skeleton
            variant="rectangular"
            width={1.75 * (theme.typography.body1.fontSize as number)}
            height={1.75 * (theme.typography.body1.fontSize as number)}
          />
          <span style={{ width: 6 }} />
          <Skeleton width={105} />
        </Typography>
        <Typography variant="body2" display={"flex"}>
          <Skeleton
            variant="rectangular"
            width={1.75 * (theme.typography.body1.fontSize as number)}
            height={1.75 * (theme.typography.body1.fontSize as number)}
          />
          <span style={{ width: 6 }} />
          <Skeleton width={105} />
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
        <span style={{ whiteSpace: "nowrap" }}>
          {[...Array(5).keys()].map((index) => {
            return (
              <Skeleton
                key={index}
                sx={{
                  m: "2px",
                  display: "inline-block",
                  verticalAlign: "middle",
                }}
                variant="circular"
                width={20}
                height={20}
              />
            );
          })}
        </span>
      </TableCell>
      <TableCell>
        <Typography variant="body1">
          <Skeleton width={90} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width={90} />
        </Typography>
      </TableCell>
      <TableCell>
        <Skeleton variant="rectangular" width={150} height={42} />
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
      <TableCell>
        <Typography variant="body1">
          <Skeleton width={75} />
        </Typography>
      </TableCell>
      {props.getStocks && (
        <TableCell align="right">
          <Skeleton
            sx={{ m: "2px", display: "inline-block", verticalAlign: "middle" }}
            variant="circular"
            width={2 * (theme.typography.body1.fontSize as number) - 4}
            height={2 * (theme.typography.body1.fontSize as number) - 4}
          />
          <Skeleton
            sx={{ m: "2px", display: "inline-block", verticalAlign: "middle" }}
            variant="circular"
            width={2 * (theme.typography.body1.fontSize as number) - 4}
            height={2 * (theme.typography.body1.fontSize as number) - 4}
          />
        </TableCell>
      )}
    </TableRow>
  );
};

interface StockRowProps {
  stock?: Stock;
  getStocks?: () => void;
}

export default StockRow;
