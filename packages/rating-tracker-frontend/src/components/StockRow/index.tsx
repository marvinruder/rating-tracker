import {
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  styled,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import NaturePeopleIcon from "@mui/icons-material/NaturePeople";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import SectorIcon from "../SectorIcon";
import StarRating from "../StarRating";
import StyleBox from "../StyleBox";
import {
  countryNameWithFlag,
  currencyName,
  groupOfIndustry,
  industryDescription,
  industryGroupName,
  industryName,
  regionName,
  regionOfCountry,
  sectorDescription,
  sectorName,
  sectorOfIndustryGroup,
  Stock,
  StockListColumn,
  superSectorDescription,
  superSectorName,
  superSectorOfSector,
  WRITE_STOCKS,
} from "rating-tracker-commons";
import { baseUrl, logoEndpoint, stockAPI } from "../../endpoints";
import { useContext, useState } from "react";
import DeleteStock from "../DeleteStock";
import EditStock from "../EditStock";
import StockDetails from "../StockDetails";
import formatMarketCap from "../../helpers/formatters";
import {
  MorningstarNavigator,
  MarketScreenerNavigator,
  MSCINavigator,
  RefinitivNavigator,
  SPNavigator,
  SustainalyticsNavigator,
} from "../../helpers/navigators";
import Range52WSlider from "../Range52WSlider";
import { NavLink } from "react-router-dom";
import { UserContext } from "../../router.js";

/**
 * This component displays information about a stock in a table row that is used in the stock list.
 *
 * @param {StockRowProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const StockRow = (props: StockRowProps): JSX.Element => {
  const { user } = useContext(UserContext);
  const theme = useTheme();

  /**
   * Displays a chip with a colored icon. The color depends on the value of the stock's
   * MSCI Implied Temperature Rise and resembles the company’s alignment with the Paris Agreement.
   */
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
  /**
   * Displays a chip with a green icon.
   */
  const GreenIconChip = styled(Chip)(() => ({
    ".MuiChip-icon": {
      color: theme.colors.sector.Defensive,
    },
  }));
  /**
   * Displays a chip with a yellow icon.
   */
  const YellowIconChip = styled(Chip)(() => ({
    ".MuiChip-icon": {
      color: theme.colors.msci.Average,
    },
  }));
  /**
   * Displays a chip with a blue icon.
   */
  const BlueIconChip = styled(Chip)(() => ({
    ".MuiChip-icon": {
      color: theme.colors.primary.main,
    },
  }));

  const [detailsDialogOpen, setDetailsDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

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

  return props.stock ? (
    // Actual stock row
    <TableRow hover sx={{ height: 59 }}>
      {/* Name and Logo */}
      <TableCell>
        <Box
          onClick={() => setDetailsDialogOpen(true)}
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <Avatar
            sx={{ width: 56, height: 56, m: "-8px", background: "none" }}
            src={baseUrl + stockAPI + logoEndpoint + `/${props.stock.ticker}?dark=${theme.palette.mode === "dark"}`}
            alt=" "
          />
          <Box width={8} />
          <Box>
            <Typography variant="body1" fontWeight="bold" color="text.primary" width={160} noWrap>
              {props.stock.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" width={160} noWrap>
              {props.stock.ticker} | {props.stock.isin}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      {/* Country and Region */}
      <TableCell
        sx={{
          display: displayColumn("Country"),
        }}
      >
        <Typography variant="body1" fontWeight="bold" color="text.primary" width={125} noWrap>
          {props.stock.country && countryNameWithFlag[props.stock.country]}
        </Typography>
        <Typography variant="body2" color="text.secondary" width={125} noWrap>
          {props.stock.country && regionName[regionOfCountry[props.stock.country]]}
        </Typography>
      </TableCell>
      {/* StyleBox */}
      <TableCell
        sx={{
          display: displayColumn("Size and Style"),
        }}
      >
        <Tooltip
          title={props.stock.size && props.stock.style ? `${props.stock.size}-${props.stock.style}` : undefined}
          arrow
        >
          <Box
            sx={{
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
          </Box>
        </Tooltip>
      </TableCell>
      {/* Sector */}
      <TableCell
        sx={{
          display: displayColumn("Sector"),
        }}
      >
        <Box display="flex" alignItems="center" width={132}>
          {props.stock.industry && (
            <SectorIcon
              industry={props.stock.industry}
              length={1.75 * (theme.typography.body1.fontSize as number)}
              type="Sector"
            />
          )}
          <Box width={6} />
          <Tooltip
            title={
              props.stock.industry && sectorDescription[sectorOfIndustryGroup[groupOfIndustry[props.stock.industry]]]
            }
            arrow
            placement="left"
          >
            <Typography variant="body1" fontWeight="bold" maxWidth={105} noWrap>
              {props.stock.industry && sectorName[sectorOfIndustryGroup[groupOfIndustry[props.stock.industry]]]}
            </Typography>
          </Tooltip>
        </Box>
        <Box display="flex" alignItems="center" width={132}>
          {props.stock.industry && (
            <SectorIcon
              industry={props.stock.industry}
              length={1.75 * (theme.typography.body2.fontSize as number)}
              type="SuperSector"
            />
          )}
          <Box width={6} />
          <Tooltip
            title={
              props.stock.industry &&
              superSectorDescription[superSectorOfSector[sectorOfIndustryGroup[groupOfIndustry[props.stock.industry]]]]
            }
            arrow
            placement="left"
          >
            <Typography variant="body2" color="text.secondary" maxWidth={105} noWrap>
              {props.stock.industry &&
                superSectorName[superSectorOfSector[sectorOfIndustryGroup[groupOfIndustry[props.stock.industry]]]]}
            </Typography>
          </Tooltip>
        </Box>
      </TableCell>
      {/* Industry */}
      <TableCell
        sx={{
          display: displayColumn("Industry"),
        }}
      >
        <Box width={150}>
          <Tooltip title={props.stock.industry && industryDescription[props.stock.industry]} arrow placement="right">
            <Typography
              variant="body1"
              fontWeight="bold"
              color="text.primary"
              maxWidth={150}
              width="max-content"
              noWrap
            >
              {props.stock.industry && industryName[props.stock.industry]}
            </Typography>
          </Tooltip>
        </Box>
        <Typography variant="body2" color="text.secondary" width={150} noWrap>
          {props.stock.industry && industryGroupName[groupOfIndustry[props.stock.industry]]}
        </Typography>
      </TableCell>
      {/* Total Score */}
      <TableCell
        sx={{
          display: displayColumn("Total Score"),
        }}
      >
        <BlueIconChip
          icon={<EmojiEventsIcon />}
          label={<strong>{Math.round(Math.max(0, 100 * props.stock.getTotalScore()))}</strong>}
          sx={{ width: 84, fontSize: 18 }}
        />
      </TableCell>
      {/* Financial Score */}
      <TableCell
        sx={{
          display: displayColumn("Financial Score"),
        }}
      >
        <YellowIconChip
          icon={<PriceCheckIcon />}
          label={<strong>{Math.round(Math.max(0, 100 * props.stock.getFinancialScore()))}</strong>}
          sx={{ width: 84, fontSize: 18 }}
        />
      </TableCell>
      {/* ESG Score */}
      <TableCell
        sx={{
          display: displayColumn("ESG Score"),
        }}
      >
        <GreenIconChip
          icon={<NaturePeopleIcon />}
          label={<strong>{Math.round(Math.max(0, 100 * props.stock.getESGScore()))}</strong>}
          sx={{ width: 84, fontSize: 18 }}
        />
      </TableCell>
      {/* Morningstar Star Rating */}
      <TableCell
        sx={{
          display: displayColumn("Star Rating"),
        }}
      >
        <MorningstarNavigator stock={props.stock}>
          <StarRating value={props.stock.starRating} />
        </MorningstarNavigator>
      </TableCell>
      {/* Morningstar Fair Value */}
      <TableCell
        sx={{
          display: displayColumn("Morningstar Fair Value"),
        }}
      >
        <MorningstarNavigator stock={props.stock}>
          <Typography variant="body1" fontWeight="bold" color="text.primary" width={90} noWrap>
            <Tooltip title={props.stock.currency && currencyName[props.stock.currency]} arrow>
              <Box sx={{ float: "left" }} display="inline-block">
                {props.stock.currency ?? ""}
              </Box>
            </Tooltip>
            <Box sx={{ float: "right" }}>{props.stock.morningstarFairValue?.toFixed(2) ?? "–"}</Box>
          </Typography>
          <Typography variant="body2" color="text.secondary" width={90} sx={{ textAlign: "right" }} noWrap>
            {props.stock.morningstarFairValue !== undefined &&
              props.stock.lastClose !== undefined &&
              props.stock.getPercentageToLastClose("morningstarFairValue") !== undefined &&
              `${props.stock.lastClose > props.stock.morningstarFairValue ? "+" : ""}${Math.round(
                props.stock.getPercentageToLastClose("morningstarFairValue")
              )}\u2009%`}
          </Typography>
        </MorningstarNavigator>
      </TableCell>
      {/* Analyst Consensus */}
      <TableCell
        sx={{
          display: displayColumn("Analyst Consensus"),
        }}
      >
        {props.stock.analystConsensus !== undefined && (
          <MarketScreenerNavigator stock={props.stock}>
            <Chip
              label={<strong>{props.stock.analystConsensus}</strong>}
              style={{ cursor: "inherit" }}
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
                opacity: props.stock.analystCount < 10 ? props.stock.analystCount / 10 : 1,
                width: 60,
              }}
              size="small"
            />
          </MarketScreenerNavigator>
        )}
      </TableCell>
      {/* Analyst Target Price */}
      <TableCell
        sx={{
          display: displayColumn("Analyst Target Price"),
        }}
      >
        <MarketScreenerNavigator stock={props.stock}>
          <Typography
            variant="body1"
            fontWeight="bold"
            color="text.primary"
            sx={{
              opacity: props.stock.analystCount < 10 ? props.stock.analystCount / 10 : 1,
            }}
            width={90}
            noWrap
          >
            <Tooltip title={props.stock.currency && currencyName[props.stock.currency]} arrow>
              <Box sx={{ float: "left" }} display="inline-block">
                {props.stock.currency ?? ""}
              </Box>
            </Tooltip>
            <Box style={{ float: "right" }}>{props.stock.analystTargetPrice?.toFixed(2) ?? "–"}</Box>
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            width={45}
            sx={{ textAlign: "left", display: "inline-block" }}
            noWrap
          >
            {props.stock.analystTargetPrice !== undefined &&
              props.stock.analystCount !== undefined &&
              props.stock.lastClose !== undefined &&
              `n\u2009=\u2009${props.stock.analystCount}`}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            width={45}
            sx={{ textAlign: "right", display: "inline-block" }}
            noWrap
          >
            {props.stock.analystTargetPrice !== undefined &&
              props.stock.analystCount !== undefined &&
              props.stock.lastClose !== undefined &&
              props.stock.getPercentageToLastClose("analystTargetPrice") !== undefined &&
              `${props.stock.lastClose > props.stock.analystTargetPrice ? "+" : ""}${Math.round(
                props.stock.getPercentageToLastClose("analystTargetPrice")
              )}\u2009%`}
          </Typography>
        </MarketScreenerNavigator>
      </TableCell>
      {/* MSCI ESG Rating */}
      <TableCell
        sx={{
          display: displayColumn("MSCI ESG Rating"),
        }}
      >
        {props.stock.msciESGRating && (
          <MSCINavigator stock={props.stock}>
            <Chip
              label={<strong>{props.stock.msciESGRating}</strong>}
              style={{ cursor: "inherit" }}
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
          </MSCINavigator>
        )}
      </TableCell>
      {/* MSCI Implied Temperature Rise */}
      <TableCell
        sx={{
          display: displayColumn("MSCI Implied Temperature Rise"),
        }}
      >
        {props.stock.msciTemperature !== undefined && (
          <MSCINavigator stock={props.stock}>
            <TemperatureChip
              icon={<ThermostatIcon />}
              label={<strong>{props.stock.msciTemperature + "°C"}</strong>}
              size="small"
              sx={{ width: 72 }}
              style={{ cursor: "inherit" }}
            />
          </MSCINavigator>
        )}
      </TableCell>
      {/* Refinitiv */}
      <TableCell
        sx={{
          display: displayColumn("Refinitiv ESG Information"),
        }}
      >
        <RefinitivNavigator stock={props.stock}>
          <Box
            sx={{
              minWidth: 90,
              display: "flex",
              alignItems: "center",
            }}
          >
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
          </Box>
        </RefinitivNavigator>
      </TableCell>
      {/* S&P ESG Score */}
      <TableCell
        sx={{
          display: displayColumn("S&P ESG Score"),
        }}
      >
        <SPNavigator stock={props.stock}>
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
        </SPNavigator>
      </TableCell>
      {/* Sustainalytics ESG Risk */}
      <TableCell
        sx={{
          display: displayColumn("Sustainalytics ESG Risk"),
        }}
      >
        {props.stock.sustainalyticsESGRisk !== undefined && (
          <SustainalyticsNavigator stock={props.stock}>
            <Chip
              label={<strong>{props.stock.sustainalyticsESGRisk}</strong>}
              style={{ cursor: "inherit" }}
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
          </SustainalyticsNavigator>
        )}
      </TableCell>
      {/* 52 Week Range */}
      <TableCell
        sx={{
          display: displayColumn("52 Week Range"),
        }}
      >
        {props.stock.lastClose !== undefined &&
          props.stock.low52w !== undefined &&
          props.stock.high52w !== undefined && (
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
      {/* Dividend Yield */}
      <TableCell
        sx={{
          display: displayColumn("Dividend Yield (%)"),
        }}
      >
        <Typography variant="body1" color="text.primary" width={45} sx={{ textAlign: "right" }} noWrap>
          {props.stock.dividendYieldPercent ?? "–"}
          {"\u2009%"}
        </Typography>
      </TableCell>
      {/* P/E Ratio */}
      <TableCell
        sx={{
          display: displayColumn("P / E Ratio"),
        }}
      >
        <Typography variant="body1" color="text.primary" width={45} sx={{ textAlign: "right" }} noWrap>
          {props.stock.priceEarningRatio ?? "–"}
        </Typography>
      </TableCell>
      {/* Market Cap */}
      <TableCell
        sx={{
          display: displayColumn("Market Capitalization"),
        }}
      >
        <Typography variant="body1" color="text.primary" width={75} noWrap>
          <Tooltip title={props.stock.currency && currencyName[props.stock.currency]} arrow>
            <Box sx={{ float: "left" }} display="inline-block">
              {props.stock.currency ?? ""}
            </Box>
          </Tooltip>
          <Box sx={{ float: "right" }}>{props.stock.marketCap !== undefined ? formatMarketCap(props.stock) : "–"}</Box>
        </Typography>
      </TableCell>
      {/* Actions */}
      {props.getStocks && (
        <TableCell style={{ whiteSpace: "nowrap" }}>
          <Tooltip title="Open in new tab" arrow>
            <IconButton component={NavLink} to={`/stock/${props.stock.ticker}`} target="_blank" size="small">
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              user.hasAccessRight(WRITE_STOCKS)
                ? "Edit Stock"
                : "You do not have the necessary access rights to update stocks."
            }
            arrow
          >
            <Box display="inline-block">
              <IconButton
                color="primary"
                size="small"
                onClick={() => setEditDialogOpen(true)}
                disabled={!user.hasAccessRight(WRITE_STOCKS)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          </Tooltip>
          <Tooltip
            title={
              user.hasAccessRight(WRITE_STOCKS)
                ? "Delete Stock"
                : "You do not have the necessary access rights to delete stocks."
            }
            arrow
          >
            <Box display="inline-block">
              <IconButton
                color="error"
                size="small"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={!user.hasAccessRight(WRITE_STOCKS)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Tooltip>
        </TableCell>
      )}
      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="lg">
        <DialogTitle style={{ paddingBottom: "0px" }}>
          <Grid container justifyContent="space-between">
            <Grid
              item
              sx={{
                display: "flex",
                alignItems: "center",
                maxWidth: "calc(100% - 40px)",
              }}
            >
              <Avatar
                sx={{
                  width: 112,
                  height: 112,
                  m: "-16px",
                  mr: "-8px",
                  background: "none",
                }}
                src={baseUrl + stockAPI + logoEndpoint + `/${props.stock.ticker}?dark=${theme.palette.mode === "dark"}`}
                alt=" "
              />
              <Box sx={{ my: 1 }}>
                <Typography variant="h4" component="h4" gutterBottom>
                  {props.stock.name}
                </Typography>
                <Typography variant="subtitle2">
                  {props.stock.ticker} | {props.stock.isin}
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <IconButton onClick={() => setDetailsDialogOpen(false)} sx={{ ml: "auto", borderRadius: 20 }}>
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0, pb: 1 }}>
          <StockDetails stock={props.stock} />
        </DialogContent>
      </Dialog>
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => (setEditDialogOpen(false), props.getStocks && props.getStocks())}>
        <EditStock stock={props.stock} getStocks={props.getStocks} onClose={() => setEditDialogOpen(false)} />
      </Dialog>
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DeleteStock stock={props.stock} getStocks={props.getStocks} onClose={() => setDeleteDialogOpen(false)} />
      </Dialog>
    </TableRow>
  ) : (
    // Skeleton of a stock row
    <TableRow hover sx={{ height: 59 }}>
      {/* Stock */}
      <TableCell>
        <Box style={{ display: "flex", alignItems: "center" }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box width={8} />
          <Box>
            <Typography variant="body1">
              <Skeleton width={160} />
            </Typography>
            <Typography variant="body2">
              <Skeleton width={160} />
            </Typography>
          </Box>
        </Box>
      </TableCell>
      {/* Country */}
      <TableCell
        sx={{
          display: displayColumn("Country"),
        }}
      >
        <Typography variant="body1">
          <Skeleton width={125} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width={125} />
        </Typography>
      </TableCell>
      {/* Size|Style */}
      <TableCell
        sx={{
          display: displayColumn("Size and Style"),
        }}
      >
        <Skeleton
          variant="rectangular"
          width={2.75 * (theme.typography.body1.fontSize as number)}
          height={2.75 * (theme.typography.body1.fontSize as number)}
        />
      </TableCell>
      {/* Sector */}
      <TableCell
        sx={{
          display: displayColumn("Sector"),
        }}
      >
        <Typography variant="body1" display={"flex"}>
          <Skeleton
            variant="rectangular"
            width={1.55 * (theme.typography.body1.fontSize as number)}
            height={1.55 * (theme.typography.body1.fontSize as number)}
            sx={{
              m: `${0.1 * (theme.typography.body1.fontSize as number)}px`,
            }}
          />
          <Box width={6} />
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
          <Box width={6} />
          <Skeleton width={105} />
        </Typography>
      </TableCell>
      {/* Industry */}
      <TableCell
        sx={{
          display: displayColumn("Industry"),
        }}
      >
        <Typography variant="body1">
          <Skeleton width={150} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width={150} />
        </Typography>
      </TableCell>
      {/* Scores */}
      <TableCell
        sx={{
          display: displayColumn("Total Score"),
        }}
      >
        <Skeleton variant="rounded" width={84} height={32} />
      </TableCell>
      <TableCell
        sx={{
          display: displayColumn("Financial Score"),
        }}
      >
        <Skeleton variant="rounded" width={84} height={32} />
      </TableCell>
      <TableCell
        sx={{
          display: displayColumn("ESG Score"),
        }}
      >
        <Skeleton variant="rounded" width={84} height={32} />
      </TableCell>
      {/* Star Rating */}
      <TableCell
        sx={{
          display: displayColumn("Star Rating"),
        }}
      >
        <Box sx={{ whiteSpace: "nowrap" }}>
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
        </Box>
      </TableCell>
      {/* Fair Value */}
      <TableCell
        sx={{
          display: displayColumn("Morningstar Fair Value"),
        }}
      >
        <Typography variant="body1">
          <Skeleton width={90} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width={90} />
        </Typography>
      </TableCell>
      {/* Analyst Consensus */}
      <TableCell
        sx={{
          display: displayColumn("Analyst Consensus"),
        }}
      >
        <Skeleton variant="rounded" width={60} height={24} />
      </TableCell>
      {/* Analyst Target */}
      <TableCell
        sx={{
          display: displayColumn("Analyst Target Price"),
        }}
      >
        <Typography variant="body1">
          <Skeleton width={90} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width={90} />
        </Typography>
      </TableCell>
      {/* MSCI ESG */}
      <TableCell
        sx={{
          display: displayColumn("MSCI ESG Rating"),
        }}
      >
        <Skeleton variant="rounded" width={48} height={24} />
      </TableCell>
      {/* MSCI Temp */}
      <TableCell
        sx={{
          display: displayColumn("MSCI Implied Temperature Rise"),
        }}
      >
        <Skeleton variant="rounded" width={72} height={24} />
      </TableCell>
      {/* Refinitiv + Emissions */}
      <TableCell
        sx={{
          display: displayColumn("Refinitiv ESG Information"),
        }}
      >
        <Box sx={{ minWidth: 90, display: "flex", alignItems: "center" }}>
          <Typography variant="body1" fontSize={18}>
            <Skeleton width={30} />
          </Typography>
          <Box sx={{ width: 30 }} />
          <Typography variant="body2" fontSize={18}>
            <Skeleton width={30} />
          </Typography>
        </Box>
      </TableCell>
      {/* S&P */}
      <TableCell
        sx={{
          display: displayColumn("S&P ESG Score"),
        }}
      >
        <Typography variant="body1" fontSize={18}>
          <Skeleton width={48} />
        </Typography>
      </TableCell>
      {/* Sustainalytics ESG Risk */}
      <TableCell
        sx={{
          display: displayColumn("Sustainalytics ESG Risk"),
        }}
      >
        <Skeleton variant="rounded" width={64} height={24} />
      </TableCell>
      {/* 52W Range */}
      <TableCell
        sx={{
          display: displayColumn("52 Week Range"),
        }}
      >
        <Skeleton variant="rectangular" width={150} height={42} />
      </TableCell>
      {/* Div Yield */}
      <TableCell
        sx={{
          display: displayColumn("Dividend Yield (%)"),
        }}
      >
        <Typography variant="body1">
          <Skeleton width={45} />
        </Typography>
      </TableCell>
      {/* P/E */}
      <TableCell
        sx={{
          display: displayColumn("P / E Ratio"),
        }}
      >
        <Typography variant="body1">
          <Skeleton width={45} />
        </Typography>
      </TableCell>
      {/* Market Cap */}
      <TableCell
        sx={{
          display: displayColumn("Market Capitalization"),
        }}
      >
        <Typography variant="body1">
          <Skeleton width={75} />
        </Typography>
      </TableCell>
      {/* Actions */}
      {props.getStocks && (
        <TableCell style={{ whiteSpace: "nowrap" }}>
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

/**
 * Properties for the StockRow component
 */
interface StockRowProps {
  /**
   * The stock to display
   */
  stock?: Stock;
  /**
   * A method to update the stock list, e.g. after a stock was modified or deleted.
   */
  getStocks?: () => void;
  /**
   * The columns to display
   */
  columns?: StockListColumn[];
}

export default StockRow;
