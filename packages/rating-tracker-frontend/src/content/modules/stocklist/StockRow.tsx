import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
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
import ThermostatIcon from "@mui/icons-material/Thermostat";
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
  logoEndpoint,
  marketScreenerEndpoint,
  morningstarEndpoint,
  msciEndpoint,
  refinitivEndpoint,
  spEndpoint,
  stockAPI,
  sustainalyticsEndpoint,
} from "../../../endpoints";
import useNotification from "../../../helpers/useNotification";
import { useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";

const Range52WSlider = styled(Slider)(({ theme }) => ({
  "@media (pointer: coarse)": {
    padding: "13px 0",
  },
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
  const TemperatureChip = styled(Chip)(() => ({
    ".MuiChip-icon": {
      color:
        props.stock.msciTemperature <= 1.5
          ? theme.colors.msci.Aligned1
          : props.stock.msciTemperature <= 2.0
          ? theme.colors.msci.Aligned2
          : props.stock.msciTemperature <= 3.2
          ? theme.colors.msci.Misaligned
          : theme.colors.msci.StronglyMisaligned,
    },
  }));

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
  const [marketScreenerId, setMarketScreenerId] = useState<string>(
    props.stock?.marketScreenerId
  );
  const [
    marketScreenerIdRequestInProgress,
    setMarketScreenerIdRequestInProgress,
  ] = useState<boolean>(false);
  const [msciId, setMsciId] = useState<string>(props.stock?.msciId);
  const [msciIdRequestInProgress, setMsciIdRequestInProgress] =
    useState<boolean>(false);
  const [ric, setRic] = useState<string>(props.stock?.ric);
  const [ricRequestInProgress, setRicRequestInProgress] =
    useState<boolean>(false);
  const [spId, setSpId] = useState<number>(props.stock?.spId);
  const [spIdRequestInProgress, setSpIdRequestInProgress] =
    useState<boolean>(false);
  const [sustainalyticsId, setSustainalyticsId] = useState<string>(
    props.stock?.sustainalyticsId
  );
  const [
    sustainalyticsIdRequestInProgress,
    setSustainalyticsIdRequestInProgress,
  ] = useState<boolean>(false);
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
            marketScreenerId:
              marketScreenerId !== props.stock.marketScreenerId
                ? marketScreenerId
                : undefined,
            msciId: msciId !== props.stock.msciId ? msciId : undefined,
            ric: ric !== props.stock.ric ? ric : undefined,
            spId: spId !== props.stock.spId ? spId : undefined,
            sustainalyticsId:
              sustainalyticsId !== props.stock.sustainalyticsId
                ? sustainalyticsId
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
          params: { morningstarId },
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

  const patchStockMarketScreenerId = () => {
    props.stock &&
      props.getStocks &&
      (setMarketScreenerIdRequestInProgress(true),
      axios
        .patch(baseUrl + stockAPI + `/${props.stock.ticker}`, undefined, {
          params: { marketScreenerId },
        })
        .then(() => {
          if (marketScreenerId) {
            axios
              .get(baseUrl + fetchAPI + marketScreenerEndpoint, {
                params: { ticker: props.stock.ticker, noSkip: true },
              })
              .then(() => {})
              .catch((e) => {
                setNotification({
                  severity: "error",
                  title:
                    "Error while fetching information from Market Screener",
                  message:
                    e.response?.status && e.response?.data?.message
                      ? `${e.response.status}: ${e.response.data.message}`
                      : e.message ?? "No additional information available.",
                });
              })
              .finally(() => setMarketScreenerIdRequestInProgress(false));
          } else {
            setMarketScreenerIdRequestInProgress(false);
          }
        })
        .catch((e) => {
          setMarketScreenerIdRequestInProgress(false);
          setNotification({
            severity: "error",
            title: "Error while adding Market Screener ID",
            message:
              e.response?.status && e.response?.data?.message
                ? `${e.response.status}: ${e.response.data.message}`
                : e.message ?? "No additional information available.",
          });
        }));
  };

  const patchStockMsciId = () => {
    props.stock &&
      props.getStocks &&
      (setMsciIdRequestInProgress(true),
      axios
        .patch(baseUrl + stockAPI + `/${props.stock.ticker}`, undefined, {
          params: { msciId },
        })
        .then(() => {
          if (msciId) {
            axios
              .get(baseUrl + fetchAPI + msciEndpoint, {
                params: { ticker: props.stock.ticker, noSkip: true },
              })
              .then(() => {})
              .catch((e) => {
                setNotification({
                  severity: "error",
                  title: "Error while fetching information from MSCI",
                  message:
                    e.response?.status && e.response?.data?.message
                      ? `${e.response.status}: ${e.response.data.message}`
                      : e.message ?? "No additional information available.",
                });
              })
              .finally(() => setMsciIdRequestInProgress(false));
          } else {
            setMsciIdRequestInProgress(false);
          }
        })
        .catch((e) => {
          setMsciIdRequestInProgress(false);
          setNotification({
            severity: "error",
            title: "Error while adding MSCI ID",
            message:
              e.response?.status && e.response?.data?.message
                ? `${e.response.status}: ${e.response.data.message}`
                : e.message ?? "No additional information available.",
          });
        }));
  };

  const patchStockRic = () => {
    props.stock &&
      props.getStocks &&
      (setRicRequestInProgress(true),
      axios
        .patch(baseUrl + stockAPI + `/${props.stock.ticker}`, undefined, {
          params: { ric },
        })
        .then(() => {
          if (ric) {
            axios
              .get(baseUrl + fetchAPI + refinitivEndpoint, {
                params: { ticker: props.stock.ticker, noSkip: true },
              })
              .then(() => {})
              .catch((e) => {
                setNotification({
                  severity: "error",
                  title: "Error while fetching information from Refinitiv",
                  message:
                    e.response?.status && e.response?.data?.message
                      ? `${e.response.status}: ${e.response.data.message}`
                      : e.message ?? "No additional information available.",
                });
              })
              .finally(() => setRicRequestInProgress(false));
          } else {
            setRicRequestInProgress(false);
          }
        })
        .catch((e) => {
          setRicRequestInProgress(false);
          setNotification({
            severity: "error",
            title: "Error while adding RIC",
            message:
              e.response?.status && e.response?.data?.message
                ? `${e.response.status}: ${e.response.data.message}`
                : e.message ?? "No additional information available.",
          });
        }));
  };

  const patchStockSpId = () => {
    props.stock &&
      props.getStocks &&
      (setSpIdRequestInProgress(true),
      axios
        .patch(baseUrl + stockAPI + `/${props.stock.ticker}`, undefined, {
          params: { spId },
        })
        .then(() => {
          if (spId) {
            axios
              .get(baseUrl + fetchAPI + spEndpoint, {
                params: { ticker: props.stock.ticker, noSkip: true },
              })
              .then(() => {})
              .catch((e) => {
                setNotification({
                  severity: "error",
                  title: "Error while fetching information from S&P",
                  message:
                    e.response?.status && e.response?.data?.message
                      ? `${e.response.status}: ${e.response.data.message}`
                      : e.message ?? "No additional information available.",
                });
              })
              .finally(() => setSpIdRequestInProgress(false));
          } else {
            setSpIdRequestInProgress(false);
          }
        })
        .catch((e) => {
          setSpIdRequestInProgress(false);
          setNotification({
            severity: "error",
            title: "Error while adding S&P ID",
            message:
              e.response?.status && e.response?.data?.message
                ? `${e.response.status}: ${e.response.data.message}`
                : e.message ?? "No additional information available.",
          });
        }));
  };

  const patchStockSustainalyticsId = () => {
    props.stock &&
      props.getStocks &&
      (setSustainalyticsIdRequestInProgress(true),
      axios
        .patch(baseUrl + stockAPI + `/${props.stock.ticker}`, undefined, {
          params: { sustainalyticsId },
        })
        .then(() => {
          if (sustainalyticsId) {
            axios
              .get(baseUrl + fetchAPI + sustainalyticsEndpoint, {
                params: { ticker: props.stock.ticker, noSkip: true },
              })
              .then(() => {})
              .catch((e) => {
                setNotification({
                  severity: "error",
                  title: "Error while fetching information from Sustainalytics",
                  message:
                    e.response?.status && e.response?.data?.message
                      ? `${e.response.status}: ${e.response.data.message}`
                      : e.message ?? "No additional information available.",
                });
              })
              .finally(() => setSustainalyticsIdRequestInProgress(false));
          } else {
            setSustainalyticsIdRequestInProgress(false);
          }
        })
        .catch((e) => {
          setSustainalyticsIdRequestInProgress(false);
          setNotification({
            severity: "error",
            title: "Error while adding Sustainalytics ID",
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
        <span style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            sx={{ width: 56, height: 56, m: "-8px", background: "none" }}
            src={
              baseUrl +
              stockAPI +
              logoEndpoint +
              `/${props.stock.ticker}?dark=${theme.palette.mode === "dark"}`
            }
            alt=" "
          />
          <span style={{ width: 8 }} />
          <div>
            <Typography
              variant="body1"
              fontWeight="bold"
              color="text.primary"
              width={160}
              noWrap
            >
              {props.stock.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              width={160}
              noWrap
            >
              {props.stock.ticker} | {props.stock.isin}
            </Typography>
          </div>
        </span>
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
            )}\u2009%`}
        </Typography>
      </TableCell>
      <TableCell>
        {props.stock.analystConsensus && (
          <Chip
            label={<strong>{props.stock.analystConsensus}</strong>}
            sx={{
              backgroundColor:
                props.stock.analystConsensus <= 0.5
                  ? theme.colors.consensus[0]
                  : props.stock.analystConsensus <= 1.5
                  ? theme.colors.consensus[1]
                  : props.stock.analystConsensus <= 2.5
                  ? theme.colors.consensus[2]
                  : props.stock.analystConsensus <= 3.5
                  ? theme.colors.consensus[3]
                  : props.stock.analystConsensus <= 4.5
                  ? theme.colors.consensus[4]
                  : props.stock.analystConsensus <= 5.5
                  ? theme.colors.consensus[5]
                  : props.stock.analystConsensus <= 6.5
                  ? theme.colors.consensus[6]
                  : props.stock.analystConsensus <= 7.5
                  ? theme.colors.consensus[7]
                  : props.stock.analystConsensus <= 8.5
                  ? theme.colors.consensus[8]
                  : props.stock.analystConsensus <= 9.5
                  ? theme.colors.consensus[9]
                  : theme.colors.consensus[10],
              opacity:
                props.stock.analystCount < 10
                  ? props.stock.analystCount / 10
                  : 1,
              width: 60,
            }}
            size="small"
          />
        )}
      </TableCell>
      <TableCell>
        <Typography
          variant="body1"
          fontWeight="bold"
          color="text.primary"
          sx={{
            opacity:
              props.stock.analystCount < 10 ? props.stock.analystCount / 10 : 1,
          }}
          width={90}
          noWrap
        >
          <span style={{ float: "left" }}>{props.stock.currency ?? ""}</span>
          <span style={{ float: "right" }}>
            {props.stock.analystTargetPrice?.toFixed(2) ?? "–"}
          </span>
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          width={45}
          sx={{ textAlign: "left", display: "inline-block" }}
          noWrap
        >
          {props.stock.analystTargetPrice &&
            props.stock.analystCount &&
            props.stock.lastClose &&
            // eslint-disable-next-line no-irregular-whitespace
            `n\u2009=\u2009${props.stock.analystCount}`}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          width={45}
          sx={{ textAlign: "right", display: "inline-block" }}
          noWrap
        >
          {props.stock.analystTargetPrice &&
            props.stock.analystCount &&
            props.stock.lastClose &&
            `${
              props.stock.lastClose > props.stock.analystTargetPrice ? "+" : ""
            }${Math.round(
              100 * (props.stock.lastClose / props.stock.analystTargetPrice - 1)
            )}\u2009%`}
        </Typography>
      </TableCell>
      <TableCell>
        {props.stock.msciESGRating && (
          <Chip
            label={<strong>{props.stock.msciESGRating}</strong>}
            sx={{
              backgroundColor: ["AAA", "AA"].includes(props.stock.msciESGRating)
                ? theme.colors.msci.Leader
                : ["B", "CCC"].includes(props.stock.msciESGRating)
                ? theme.colors.msci.Laggard
                : theme.colors.msci.Average,
              color: theme.colors.alpha.trueWhite[100],
              width: 48,
            }}
            size="small"
          />
        )}
      </TableCell>
      <TableCell>
        {props.stock.msciTemperature && (
          <TemperatureChip
            icon={<ThermostatIcon />}
            label={<strong>{props.stock.msciTemperature + "°C"}</strong>}
            size="small"
            sx={{ width: 72 }}
          />
        )}
      </TableCell>
      <TableCell>
        <div style={{ minWidth: 90, display: "flex", alignItems: "center" }}>
          <Typography
            variant="body1"
            fontWeight="bold"
            color="text.primary"
            width={45}
            fontSize={18}
            sx={{ textAlign: "left", display: "inline-block" }}
            noWrap
          >
            {props.stock.refinitivESGScore}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            width={45}
            fontSize={18}
            sx={{ textAlign: "right", display: "inline-block" }}
            noWrap
          >
            {props.stock.refinitivEmissions}
          </Typography>
        </div>
      </TableCell>
      <TableCell>
        <Typography
          variant="body1"
          fontWeight="bold"
          color="text.primary"
          width={48}
          fontSize={18}
          noWrap
          align="right"
        >
          {props.stock.spESGScore}
        </Typography>
      </TableCell>
      <TableCell>
        {props.stock.sustainalyticsESGRisk && (
          <Chip
            label={<strong>{props.stock.sustainalyticsESGRisk}</strong>}
            sx={{
              backgroundColor:
                props.stock.sustainalyticsESGRisk < 10
                  ? theme.colors.sustainalytics.negligible
                  : props.stock.sustainalyticsESGRisk < 20
                  ? theme.colors.sustainalytics.low
                  : props.stock.sustainalyticsESGRisk < 30
                  ? theme.colors.sustainalytics.medium
                  : props.stock.sustainalyticsESGRisk < 40
                  ? theme.colors.sustainalytics.high
                  : theme.colors.sustainalytics.severe,
              width: 64,
            }}
            size="small"
          />
        )}
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
              {
                value: props.stock.low52w,
                label: props.stock.low52w?.toFixed(2),
              },
              {
                value: props.stock.high52w,
                label: props.stock.high52w?.toFixed(2),
              },
            ]}
            valueLabelDisplay="on"
            valueLabelFormat={(value) => value.toFixed(2)}
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
          {"\u2009%"}
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
                filterOptions={(options) => {
                  const currentInputValue = countryInputValue
                    .trim()
                    .toUpperCase();
                  const filteredOptions = options.filter(
                    (option) =>
                      countryName[option]
                        .toUpperCase()
                        .startsWith(countryInputValue.trim().toUpperCase()) &&
                      option != currentInputValue
                  );
                  isCountry(currentInputValue) &&
                    filteredOptions.unshift(currentInputValue);
                  return filteredOptions;
                }}
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
            <Grid item xs={12} container spacing={1} alignItems="center">
              <Grid item xs={7.5}>
                <TextField
                  onChange={(event) => {
                    setMarketScreenerId(event.target.value);
                  }}
                  label="MarketScreener ID"
                  value={marketScreenerId}
                  placeholder={"e.g. APPLE-INC-4849"}
                  sx={{ maxWidth: "300px" }}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <LoadingButton
                  size="small"
                  loading={marketScreenerIdRequestInProgress}
                  onClick={patchStockMarketScreenerId}
                  disabled={requestInProgress}
                  variant="contained"
                  startIcon={<PublishedWithChangesIcon />}
                >
                  {"Update and fetch"}
                </LoadingButton>
              </Grid>
            </Grid>
            <Grid item xs={12} container spacing={1} alignItems="center">
              <Grid item xs={7.5}>
                <TextField
                  onChange={(event) => {
                    setMsciId(event.target.value);
                  }}
                  label="MSCI ID"
                  value={msciId}
                  placeholder={"e.g. apple-inc/IID000000002157615"}
                  sx={{ maxWidth: "300px" }}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <LoadingButton
                  size="small"
                  loading={msciIdRequestInProgress}
                  onClick={patchStockMsciId}
                  disabled={requestInProgress}
                  variant="contained"
                  startIcon={<PublishedWithChangesIcon />}
                >
                  {"Update and fetch"}
                </LoadingButton>
              </Grid>
            </Grid>
            <Grid item xs={12} container spacing={1} alignItems="center">
              <Grid item xs={7.5}>
                <TextField
                  onChange={(event) => {
                    setRic(event.target.value);
                  }}
                  label="RIC"
                  value={ric}
                  placeholder={"e.g. AAPL.O"}
                  sx={{ maxWidth: "300px" }}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <LoadingButton
                  size="small"
                  loading={ricRequestInProgress}
                  onClick={patchStockRic}
                  disabled={requestInProgress}
                  variant="contained"
                  startIcon={<PublishedWithChangesIcon />}
                >
                  {"Update and fetch"}
                </LoadingButton>
              </Grid>
            </Grid>
            <Grid item xs={12} container spacing={1} alignItems="center">
              <Grid item xs={7.5}>
                <TextField
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  onChange={(event) => {
                    if (!isNaN(+event.target.value)) {
                      setSpId(+event.target.value);
                    }
                  }}
                  label="S&P ID"
                  value={spId}
                  placeholder={"e.g. 4004205"}
                  sx={{ maxWidth: "300px" }}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <LoadingButton
                  size="small"
                  loading={spIdRequestInProgress}
                  onClick={patchStockSpId}
                  disabled={requestInProgress}
                  variant="contained"
                  startIcon={<PublishedWithChangesIcon />}
                >
                  {"Update and fetch"}
                </LoadingButton>
              </Grid>
            </Grid>
            <Grid item xs={12} container spacing={1} alignItems="center">
              <Grid item xs={7.5}>
                <TextField
                  onChange={(event) => {
                    setSustainalyticsId(event.target.value);
                  }}
                  label="Sustainalytics ID"
                  value={sustainalyticsId}
                  placeholder={"e.g. apple-inc/1007903183"}
                  sx={{ maxWidth: "300px" }}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <LoadingButton
                  size="small"
                  loading={sustainalyticsIdRequestInProgress}
                  onClick={patchStockSustainalyticsId}
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
      {/* Stock */}
      <TableCell>
        <span style={{ display: "flex", alignItems: "center" }}>
          <Skeleton variant="circular" width={40} height={40} />
          <span style={{ width: 8 }} />
          <div>
            <Typography variant="body1">
              <Skeleton width={160} />
            </Typography>
            <Typography variant="body2">
              <Skeleton width={160} />
            </Typography>
          </div>
        </span>
      </TableCell>
      {/* Country */}
      <TableCell>
        <Typography variant="body1">
          <Skeleton width={125} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width={125} />
        </Typography>
      </TableCell>
      {/* Size|Style */}
      <TableCell>
        <Skeleton
          variant="rectangular"
          width={2.75 * (theme.typography.body1.fontSize as number)}
          height={2.75 * (theme.typography.body1.fontSize as number)}
        />
      </TableCell>
      {/* Sector */}
      <TableCell>
        <Typography variant="body1" display={"flex"}>
          <Skeleton
            variant="rectangular"
            width={1.55 * (theme.typography.body1.fontSize as number)}
            height={1.55 * (theme.typography.body1.fontSize as number)}
            sx={{
              m: `${0.1 * (theme.typography.body1.fontSize as number)}px`,
            }}
          />
          <span style={{ width: 6 }} />
          <Skeleton width={105} />
        </Typography>
        <Typography variant="body2" display={"flex"}>
          <Skeleton
            variant="rectangular"
            width={1.55 * (theme.typography.body1.fontSize as number)}
            height={1.55 * (theme.typography.body1.fontSize as number)}
            sx={{
              m: `${0.1 * (theme.typography.body1.fontSize as number)}px`,
            }}
          />
          <span style={{ width: 6 }} />
          <Skeleton width={105} />
        </Typography>
      </TableCell>
      {/* Industry */}
      <TableCell>
        <Typography variant="body1">
          <Skeleton width={150} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width={150} />
        </Typography>
      </TableCell>
      {/* Star Rating */}
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
      {/* Fair Value */}
      <TableCell>
        <Typography variant="body1">
          <Skeleton width={90} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width={90} />
        </Typography>
      </TableCell>
      {/* Analyst Consensus */}
      <TableCell>
        <Skeleton variant="rounded" width={60} height={24} />
      </TableCell>
      {/* Analyst Target */}
      <TableCell>
        <Typography variant="body1">
          <Skeleton width={90} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width={90} />
        </Typography>
      </TableCell>
      {/* MSCI ESG */}
      <TableCell>
        <Skeleton width={48} height={24} />
      </TableCell>
      {/* MSCI Temp */}
      <TableCell>
        <Skeleton width={72} height={24} />
      </TableCell>
      {/* Refinitiv + Emissions */}
      <TableCell>
        <div style={{ minWidth: 90, display: "flex", alignItems: "center" }}>
          <Typography variant="body1" fontSize={18}>
            <Skeleton width={30} />
          </Typography>
          <div style={{ width: 30 }} />
          <Typography variant="body2" fontSize={18}>
            <Skeleton width={30} />
          </Typography>
        </div>
      </TableCell>
      {/* S&P */}
      <TableCell>
        <Typography variant="body1" fontSize={18}>
          <Skeleton width={48} />
        </Typography>
      </TableCell>
      {/* Sustainalytics ESG Risk */}
      <TableCell>
        <Skeleton variant="rounded" width={64} height={24} />
      </TableCell>
      {/* 52W Range */}
      <TableCell>
        <Skeleton variant="rectangular" width={150} height={42} />
      </TableCell>
      {/* Div Yield */}
      <TableCell>
        <Typography variant="body1">
          <Skeleton width={45} />
        </Typography>
      </TableCell>
      {/* P/E */}
      <TableCell>
        <Typography variant="body1">
          <Skeleton width={45} />
        </Typography>
      </TableCell>
      {/* Market Cap */}
      <TableCell>
        <Typography variant="body1">
          <Skeleton width={75} />
        </Typography>
      </TableCell>
      {/* Actions */}
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
