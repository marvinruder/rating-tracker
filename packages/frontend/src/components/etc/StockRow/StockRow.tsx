import {
  Avatar,
  Badge,
  Box,
  Chip,
  darken,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Slide,
  SlideProps,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import BookmarkRemoveIcon from "@mui/icons-material/BookmarkRemove";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import VerifiedIcon from "@mui/icons-material/Verified";
import NaturePeopleIcon from "@mui/icons-material/NaturePeople";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import StarIcon from "@mui/icons-material/Star";
import StarsIcon from "@mui/icons-material/Stars";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import {
  countryNameWithFlag,
  currencyName,
  favoriteEndpointPath,
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
  stockLogoEndpointPath,
  superSectorDescription,
  superSectorName,
  superSectorOfSector,
  WatchlistSummary,
  WRITE_STOCKS_ACCESS,
} from "@rating-tracker/commons";
import { baseUrl } from "../../../router";
import { useContext, useState } from "react";
import { AddStockToWatchlist, DeleteStock, EditStock, RemoveStockFromWatchlist } from "../../dialogs";
import { StockDetails } from "../StockDetails";
import formatMarketCap from "../../../utils/formatters";
import {
  MorningstarNavigator,
  MarketScreenerNavigator,
  MSCINavigator,
  RefinitivNavigator,
  SPNavigator,
  SustainalyticsNavigator,
} from "../../../utils/navigators";
import { Range52WSlider, SectorIcon, StarRating, StyleBox } from "../../stockProperties";
import { NavLink } from "react-router-dom";
import { UserContext } from "../../../router";
import axios from "axios";
import { useNotification } from "../../../contexts/NotificationContext";
import { BlueIconChip, YellowIconChip, GreenIconChip, TemperatureChip } from "../../chips";

/**
 * This component displays information about a stock in a table row that is used in the stock list.
 *
 * @param {StockRowProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const StockRow = (props: StockRowProps): JSX.Element => {
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const { setNotification } = useNotification();

  const [optionsMenuOpen, setOptionsMenuOpen] = useState<boolean>(false);
  const [optionsMenuPositionEvent, setOptionsMenuPositionEvent] = useState<React.MouseEvent<HTMLElement, MouseEvent>>();
  const [detailsDialogOpen, setDetailsDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [addToWatchlistDialogOpen, setAddToWatchlistDialogOpen] = useState<boolean>(false);
  const [removeFromWatchlistDialogOpen, setRemoveFromWatchlistDialogOpen] = useState<boolean>(false);

  const fullScreenDialogs = !useMediaQuery("(min-width:664px)");

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
    <TableRow
      hover
      sx={{
        height: 59,
        backgroundColor: props.isFavorite && theme.colors.warning.lighter,
        ":hover, &.MuiTableRow-hover:hover": {
          backgroundColor: props.isFavorite && darken(theme.colors.warning.lighter, 0.15),
        },
      }}
      onContextMenu={(e) => {
        if (
          !addToWatchlistDialogOpen &&
          !removeFromWatchlistDialogOpen &&
          !editDialogOpen &&
          !deleteDialogOpen &&
          !detailsDialogOpen
        ) {
          e.preventDefault();
          if (optionsMenuOpen) {
            setOptionsMenuOpen(false);
          } else {
            setOptionsMenuPositionEvent(e);
            setOptionsMenuOpen(true);
          }
        }
      }}
    >
      {/* Actions */}
      {props.getStocks && (
        <TableCell style={{ whiteSpace: "nowrap" }}>
          <Tooltip title="Options" placement="top" arrow>
            <IconButton
              size="small"
              color="secondary"
              onClick={(e) => {
                setOptionsMenuPositionEvent(e);
                setOptionsMenuOpen(true);
              }}
            >
              <ArrowDropDownIcon />
            </IconButton>
          </Tooltip>
          <Box
            id={`cursor-over-${props.stock.ticker}`}
            sx={{
              position: "fixed",
              visibility: "hidden",
              top: optionsMenuPositionEvent?.clientY,
              left: optionsMenuPositionEvent?.clientX,
            }}
          />
          <Menu
            open={optionsMenuOpen}
            onClose={() => setOptionsMenuOpen(false)}
            anchorEl={() => document.getElementById(`cursor-over-${props.stock.ticker}`)}
          >
            <MenuItem
              onClick={() => setOptionsMenuOpen(false)}
              component={NavLink}
              to={`/stock/${props.stock.ticker}`}
              target="_blank"
            >
              <ListItemIcon>
                <OpenInNewIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                <Typography textOverflow="ellipsis" noWrap>
                  Open “{props.stock.ticker}” in new tab
                </Typography>
              </ListItemText>
            </MenuItem>
            {!props.watchlist && (
              <MenuItem
                onClick={() => {
                  (props.isFavorite ? axios.delete : axios.put)(
                    baseUrl + favoriteEndpointPath + `/${props.stock.ticker}`,
                  )
                    .then(() => props.getStocks && props.getStocks())
                    .catch((e) => {
                      setNotification({
                        severity: "error",
                        title: props.isFavorite
                          ? `Error while removing “${props.stock.name}” from favorites`
                          : `Error while adding “${props.stock.name}” to favorites`,
                        message:
                          e.response?.status && e.response?.data?.message
                            ? `${e.response.status}: ${e.response.data.message}`
                            : e.message ?? "No additional information available.",
                      });
                    });
                }}
              >
                <ListItemIcon>
                  {props.isFavorite ? (
                    <StarOutlineIcon color="warning" fontSize="small" />
                  ) : (
                    <StarIcon color="warning" fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText>
                  <Typography textOverflow="ellipsis" noWrap>
                    {props.isFavorite
                      ? `Remove “${props.stock.ticker}” from Favorites`
                      : `Mark “${props.stock.ticker}” as Favorite`}
                  </Typography>
                </ListItemText>
              </MenuItem>
            )}
            {!props.watchlist && (
              <MenuItem onClick={() => setAddToWatchlistDialogOpen(true)}>
                <ListItemIcon>
                  <BookmarkAddIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  <Typography textOverflow="ellipsis" noWrap>
                    Add “{props.stock.ticker}” to watchlist…
                  </Typography>
                </ListItemText>
              </MenuItem>
            )}
            {!props.watchlist && (
              <MenuItem
                onClick={() => setEditDialogOpen(true)}
                sx={{ display: !user.hasAccessRight(WRITE_STOCKS_ACCESS) && "none" }}
              >
                <ListItemIcon>
                  <EditIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  <Typography textOverflow="ellipsis" noWrap>
                    Edit “{props.stock.ticker}”…
                  </Typography>
                </ListItemText>
              </MenuItem>
            )}
            {!props.watchlist && (
              <MenuItem
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ display: !user.hasAccessRight(WRITE_STOCKS_ACCESS) && "none" }}
              >
                <ListItemIcon>
                  <DeleteIcon color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  <Typography textOverflow="ellipsis" noWrap>
                    Delete “{props.stock.ticker}”…
                  </Typography>
                </ListItemText>
              </MenuItem>
            )}
            {props.watchlist && (
              <MenuItem onClick={() => setRemoveFromWatchlistDialogOpen(true)}>
                <ListItemIcon>
                  <BookmarkRemoveIcon color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  <Typography textOverflow="ellipsis" noWrap>
                    Remove “{props.stock.ticker}” from “{props.watchlist.name}”
                  </Typography>
                </ListItemText>
              </MenuItem>
            )}
          </Menu>
        </TableCell>
      )}
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
          <Badge
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            badgeContent={
              props.isFavorite ? (
                <Tooltip title="This stock is marked as a favorite" arrow>
                  <StarsIcon sx={{ width: 16, height: 16 }} color="warning" />
                </Tooltip>
              ) : undefined
            }
            overlap="circular"
          >
            <Avatar
              sx={{ width: 56, height: 56, m: "-8px", background: "none" }}
              src={baseUrl + stockLogoEndpointPath + `/${props.stock.ticker}?dark=${theme.palette.mode === "dark"}`}
              alt=" "
            />
          </Badge>
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
          icon={<VerifiedIcon />}
          label={<strong>{Math.round(Math.max(0, 100 * props.stock.totalScore))}</strong>}
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
          label={<strong>{Math.round(Math.max(0, 100 * props.stock.financialScore))}</strong>}
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
          label={<strong>{Math.round(Math.max(0, 100 * props.stock.esgScore))}</strong>}
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
            {props.stock.morningstarFairValuePercentageToLastClose !== null &&
              `${props.stock.morningstarFairValuePercentageToLastClose > 0 ? "+" : ""}${Math.round(
                props.stock.morningstarFairValuePercentageToLastClose,
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
        {props.stock.analystConsensus !== null && (
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
            {props.stock.analystTargetPrice !== null &&
              props.stock.analystCount !== null &&
              props.stock.lastClose !== null &&
              `n\u2009=\u2009${props.stock.analystCount}`}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            width={45}
            sx={{ textAlign: "right", display: "inline-block" }}
            noWrap
          >
            {props.stock.analystCount !== null &&
              props.stock.analystTargetPricePercentageToLastClose !== null &&
              `${props.stock.analystTargetPricePercentageToLastClose > 0 ? "+" : ""}${Math.round(
                props.stock.analystTargetPricePercentageToLastClose,
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
        {props.stock.msciTemperature !== null && (
          <MSCINavigator stock={props.stock}>
            <TemperatureChip
              stock={props.stock}
              icon={<ThermostatIcon />}
              label={<strong>{props.stock.msciTemperature + "\u2009℃"}</strong>}
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
        {props.stock.sustainalyticsESGRisk !== null && (
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
        {props.stock.lastClose !== null && props.stock.low52w !== null && props.stock.high52w !== null && (
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
          <Box sx={{ float: "right" }}>{props.stock.marketCap !== null ? formatMarketCap(props.stock) : "–"}</Box>
        </Typography>
      </TableCell>
      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullScreen={fullScreenDialogs}
        TransitionComponent={fullScreenDialogs ? Slide : undefined}
        TransitionProps={{ direction: "up" } as SlideProps}
      >
        <DialogTitle>
          <Grid container justifyContent="space-between">
            <Grid item display="flex" alignItems="center" maxWidth="calc(100% - 40px)">
              <Avatar
                sx={{
                  width: 112,
                  height: 112,
                  m: "-16px",
                  mr: "-8px",
                  background: "none",
                }}
                src={baseUrl + stockLogoEndpointPath + `/${props.stock.ticker}?dark=${theme.palette.mode === "dark"}`}
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
              <IconButton onClick={() => setDetailsDialogOpen(false)} sx={{ borderRadius: 20 }}>
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
      {/* Add to Watchlist Dialog */}
      <Dialog
        maxWidth="xs"
        open={addToWatchlistDialogOpen}
        onClose={() => (setAddToWatchlistDialogOpen(false), setOptionsMenuOpen(false))}
      >
        <AddStockToWatchlist
          stock={props.stock}
          onClose={() => (setAddToWatchlistDialogOpen(false), setOptionsMenuOpen(false), props.getStocks())}
        />
      </Dialog>
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => (setEditDialogOpen(false), props.getStocks && props.getStocks())}>
        <EditStock stock={props.stock} getStocks={props.getStocks} onClose={() => setEditDialogOpen(false)} />
      </Dialog>
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DeleteStock stock={props.stock} getStocks={props.getStocks} onClose={() => setDeleteDialogOpen(false)} />
      </Dialog>
      {/* Remove from Watchlist Dialog */}
      <Dialog open={removeFromWatchlistDialogOpen} onClose={() => setRemoveFromWatchlistDialogOpen(false)}>
        <RemoveStockFromWatchlist
          stock={props.stock}
          watchlist={props.watchlist}
          getWatchlist={props.getStocks}
          onClose={() => setRemoveFromWatchlistDialogOpen(false)}
        />
      </Dialog>
    </TableRow>
  ) : (
    // Skeleton of a stock row
    <TableRow hover sx={{ height: 59 }}>
      {/* Actions */}
      {props.getStocks && (
        <TableCell style={{ whiteSpace: "nowrap" }}>
          <Skeleton
            sx={{ m: "4px", display: "inline-block", verticalAlign: "middle" }}
            variant="circular"
            width={2 * (theme.typography.body1.fontSize as number) - 4}
            height={2 * (theme.typography.body1.fontSize as number) - 4}
          />
        </TableCell>
      )}
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
        <Typography variant="body1" display="flex">
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
        <Typography variant="body2" display="flex">
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
   * Whether the stock is a favorite stock of the user.
   */
  isFavorite?: boolean;
  /**
   * A watchlist the stock is in. If set, the stock row is shown as part of that watchlist’s stocks.
   */
  watchlist?: WatchlistSummary;
  /**
   * A method to update the stock list, e.g. after a stock was modified or deleted.
   */
  getStocks?: () => void;
  /**
   * The columns to display
   */
  columns?: StockListColumn[];
}
