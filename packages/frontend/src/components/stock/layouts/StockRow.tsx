import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import BookmarkRemoveIcon from "@mui/icons-material/BookmarkRemove";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import NaturePeopleIcon from "@mui/icons-material/NaturePeople";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import StarsIcon from "@mui/icons-material/Stars";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import VerifiedIcon from "@mui/icons-material/Verified";
import {
  Avatar,
  Badge,
  Box,
  Chip,
  darken,
  Dialog,
  IconButton,
  InputAdornment,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import type {
  PortfolioRawData,
  PortfolioSummary,
  Stock,
  StockListColumn,
  WatchlistSummary,
  WeightedStock,
} from "@rating-tracker/commons";
import {
  baseURL,
  countryNameWithFlag,
  currencyMinorUnits,
  currencyName,
  favoritesAPIPath,
  getTotalAmount,
  groupOfIndustry,
  industryDescription,
  industryGroupName,
  industryName,
  portfoliosAPIPath,
  regionName,
  regionOfCountry,
  sectorDescription,
  sectorName,
  sectorOfIndustryGroup,
  stockLogoEndpointSuffix,
  stocksAPIPath,
  superSectorDescription,
  superSectorName,
  superSectorOfSector,
  WRITE_STOCKS_ACCESS,
} from "@rating-tracker/commons";
import { memo, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

import { useFavoritesContextState, useFavoritesContextUpdater } from "../../../contexts/FavoritesContext";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import { useUserContextState } from "../../../contexts/UserContext";
import api from "../../../utils/api";
import { CurrencyWithTooltip, formatMarketCap, formatPercentage } from "../../../utils/formatters";
import { BlueIconChip } from "../../chips/BlueIconChip";
import { GreenIconChip } from "../../chips/GreenIconChip";
import { TemperatureChip } from "../../chips/TemperatureChip";
import { YellowIconChip } from "../../chips/YellowIconChip";
import { AddStockToPortfolio } from "../../dialogs/portfolio/AddStockToPortfolio";
import { RemoveStockFromPortfolio } from "../../dialogs/portfolio/RemoveStockFromPortfolio";
import { DeleteStock } from "../../dialogs/stock/DeleteStock";
import { EditStock } from "../../dialogs/stock/EditStock";
import { AddStockToWatchlist } from "../../dialogs/watchlist/AddStockToWatchlist";
import { RemoveStockFromWatchlist } from "../../dialogs/watchlist/RemoveStockFromWatchlist";
import {
  MorningstarNavigator,
  MarketScreenerNavigator,
  MSCINavigator,
  LSEGNavigator,
  SPNavigator,
  SustainalyticsNavigator,
} from "../../etc/Navigators";
import { AnalystRatingBar } from "../properties/AnalystRatingBar";
import { Range52WSlider } from "../properties/Range52WSlider";
import { SectorIcon } from "../properties/SectorIcon";
import { Sparkline } from "../properties/Sparkline";
import { StarRating } from "../properties/StarRating";
import { StyleBox } from "../properties/StyleBox";

/**
 * This component displays information about a stock in a table row that is used in the stock list.
 * @param props The properties of the component.
 * @returns The component.
 */
export const StockRow = (props: StockRowProps): JSX.Element => {
  const { user } = useUserContextState();
  const { favorites } = useFavoritesContextState();
  const { refetchFavorites } = useFavoritesContextUpdater();

  const isFavorite = favorites?.includes(props.stock?.ticker);

  const theme = useTheme();
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  const amountInputRef = useRef<HTMLInputElement>(null);

  const [optionsMenuOpen, setOptionsMenuOpen] = useState<boolean>(false);
  const [optionsMenuPositionEvent, setOptionsMenuPositionEvent] = useState<React.MouseEvent<HTMLElement, MouseEvent>>();
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [addToWatchlistDialogOpen, setAddToWatchlistDialogOpen] = useState<boolean>(false);
  const [removeFromWatchlistDialogOpen, setRemoveFromWatchlistDialogOpen] = useState<boolean>(false);
  const [addToPortfolioDialogOpen, setAddToPortfolioDialogOpen] = useState<boolean>(false);
  const [removeFromPortfolioDialogOpen, setRemoveFromPortfolioDialogOpen] = useState<boolean>(false);

  const [amountInput, setAmountInput] = useState<string>(
    props.portfolio &&
      props.stock &&
      "amount" in props.stock &&
      props.stock.amount.toFixed(currencyMinorUnits[props.portfolio.currency]),
  );
  const [amountError, setAmountError] = useState<string>(""); // Error message for the amount text field.

  /**
   * Checks for errors in the input fields.
   * @returns Whether the input fields are valid.
   */
  const validate = (): boolean => {
    const isAmountValid = amountInputRef.current.checkValidity();
    // Focus the text field again so that the error can be cleared when the user leaves the field thereafter
    if (!isAmountValid) amountInputRef.current.focus();
    return isAmountValid;
  };

  /**
   * Edits the stock in the portfolio.
   */
  const updateStockInPortfolio = () => {
    if (!validate() || !("id" in props.portfolio)) return;
    api
      .patch(`${portfoliosAPIPath}/${props.portfolio.id}${stocksAPIPath}/${encodeURIComponent(props.stock.ticker)}`, {
        params: { amount: +amountInput },
      })
      .then(() => (props.getPortfolio(), props.getStocks()))
      .catch((e) => setErrorNotificationOrClearSession(e, "editing stock in portfolio"));
  };

  const contextMenuPositionRef = useRef<HTMLElement>(null);
  const updateAmountButtonRef = useRef<HTMLButtonElement>(null);
  const infiniteLoadingTriggerRef = useRef<HTMLTableRowElement>(null);

  /**
   * Returns an appropriate CSS `display` property value for a column. The value is derived from the
   * columns filter values that are passed to the component.
   * @param column The column for which the display value should be returned.
   * @returns The CSS `display` property value.
   */
  const displayColumn = (column: StockListColumn): "none" | undefined => {
    if (props.columns && !props.columns.includes(column)) {
      // If the filter is in use, but the column is not included, hide the column.
      return "none";
    }
    // If unset, the column is visible.
    return undefined;
  };

  useEffect(() => {
    if (props.isInfiniteLoadingTrigger && infiniteLoadingTriggerRef.current) {
      const observer = new IntersectionObserver((entry) => {
        if (entry[0].isIntersecting) {
          props.getStocks();
          observer.disconnect();
        }
      });
      observer.observe(infiniteLoadingTriggerRef.current);
      return () => infiniteLoadingTriggerRef.current && observer.unobserve(infiniteLoadingTriggerRef.current);
    }
  }, [infiniteLoadingTriggerRef.current]);

  return props.stock ? (
    // Actual stock row
    <TableRow
      hover
      sx={{
        height: 59,
        backgroundColor: isFavorite && theme.colors.warning.lighter,
        ":hover, &.MuiTableRow-hover:hover": {
          backgroundColor: isFavorite && darken(theme.colors.warning.lighter, 0.15),
        },
      }}
      onContextMenu={(e) => {
        if (props.hideActionsMenu) return;
        if (
          !addToWatchlistDialogOpen &&
          !removeFromWatchlistDialogOpen &&
          !addToPortfolioDialogOpen &&
          !removeFromPortfolioDialogOpen &&
          !editDialogOpen &&
          !deleteDialogOpen
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
      {props.hideActionsMenu ? (
        <TableCell sx={{ p: 0.25 }} />
      ) : (
        <TableCell style={{ whiteSpace: "nowrap" }}>
          <Tooltip title="Options" placement="top" arrow>
            <IconButton
              size="small"
              color="secondary"
              onClick={(e) => (setOptionsMenuPositionEvent(e), setOptionsMenuOpen(true))}
            >
              <ArrowDropDownIcon />
            </IconButton>
          </Tooltip>
          <Box
            ref={contextMenuPositionRef}
            sx={{
              position: "fixed",
              visibility: "hidden",
              top: optionsMenuPositionEvent?.clientY,
              left: optionsMenuPositionEvent?.clientX,
            }}
          />
          <Menu
            open={optionsMenuOpen}
            onClick={() => setOptionsMenuOpen(false)}
            onClose={() => setOptionsMenuOpen(false)}
            anchorEl={contextMenuPositionRef.current}
          >
            <MenuItem
              component={NavLink}
              to={`${stocksAPIPath}/${encodeURIComponent(props.stock.ticker)}`}
              target="_blank"
            >
              <ListItemIcon>
                <OpenInNewIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={`Open “${props.stock.ticker}” in new tab`}
                primaryTypographyProps={{ color: "text.secondary" }}
              />
            </MenuItem>
            {!props.watchlist && !props.portfolio && (
              <MenuItem
                onClick={() => {
                  (isFavorite ? api.delete : api.put)(favoritesAPIPath + `/${encodeURIComponent(props.stock.ticker)}`)
                    .then(refetchFavorites)
                    .catch((e) =>
                      setErrorNotificationOrClearSession(
                        e,
                        isFavorite
                          ? `removing “${props.stock.name}” from favorites`
                          : `adding “${props.stock.name}” to favorites`,
                      ),
                    );
                }}
              >
                <ListItemIcon>
                  {isFavorite ? (
                    <StarOutlineIcon color="warning" fontSize="small" />
                  ) : (
                    <StarIcon color="warning" fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    isFavorite
                      ? `Remove “${props.stock.ticker}” from Favorites`
                      : `Mark “${props.stock.ticker}” as Favorite`
                  }
                  primaryTypographyProps={{ color: "text.secondary" }}
                />
              </MenuItem>
            )}
            {!props.watchlist && !props.portfolio && (
              <MenuItem onClick={() => setAddToWatchlistDialogOpen(true)}>
                <ListItemIcon>
                  <BookmarkAddIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={`Add “${props.stock.ticker}” to watchlist…`}
                  primaryTypographyProps={{ color: "text.secondary" }}
                />
              </MenuItem>
            )}
            {!props.watchlist && !props.portfolio && (
              <MenuItem onClick={() => setAddToPortfolioDialogOpen(true)}>
                <ListItemIcon>
                  <AddShoppingCartIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={`Add “${props.stock.ticker}” to portfolio…`}
                  primaryTypographyProps={{ color: "text.secondary" }}
                />
              </MenuItem>
            )}
            {!props.watchlist && !props.portfolio && (
              <MenuItem
                onClick={() => setEditDialogOpen(true)}
                sx={{ display: !user.hasAccessRight(WRITE_STOCKS_ACCESS) && "none" }}
              >
                <ListItemIcon>
                  <EditIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={`Edit “${props.stock.ticker}”…`}
                  primaryTypographyProps={{ color: "text.secondary" }}
                />
              </MenuItem>
            )}
            {!props.watchlist && !props.portfolio && (
              <MenuItem
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ display: !user.hasAccessRight(WRITE_STOCKS_ACCESS) && "none" }}
              >
                <ListItemIcon>
                  <DeleteIcon color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={`Delete “${props.stock.ticker}”…`}
                  primaryTypographyProps={{ color: "text.secondary" }}
                />
              </MenuItem>
            )}
            {props.watchlist && (
              <MenuItem onClick={() => setRemoveFromWatchlistDialogOpen(true)}>
                <ListItemIcon>
                  <BookmarkRemoveIcon color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={`Remove “${props.stock.ticker}” from “${props.watchlist.name}”`}
                  primaryTypographyProps={{ color: "text.secondary" }}
                />
              </MenuItem>
            )}
            {props.portfolio && "id" in props.portfolio && (
              <MenuItem onClick={() => setRemoveFromPortfolioDialogOpen(true)}>
                <ListItemIcon>
                  <RemoveShoppingCartIcon color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={`Remove “${props.stock.ticker}” from “${props.portfolio.name}”`}
                  primaryTypographyProps={{ color: "text.secondary" }}
                />
              </MenuItem>
            )}
          </Menu>
        </TableCell>
      )}
      {/* Amount in Portfolio */}
      {"amount" in props.stock && (
        <TableCell>
          <Tooltip
            title={
              props.stock.amount === +amountInput
                ? formatPercentage(props.stock.amount, { total: getTotalAmount(props.portfolio) })
                : undefined
            }
            arrow
          >
            <TextField
              // This text field is read-only in the Portfolio Builder result list, where the ID is undefined
              sx={{ width: "id" in props.portfolio ? 150 : 120, ...(amountError ? { mt: "6px" } : {}) }}
              disabled={!("id" in props.portfolio)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ width: 30, mt: "1px" }}>
                    {props.portfolio.currency}
                  </InputAdornment>
                ),
                endAdornment: "id" in props.portfolio && (
                  <InputAdornment position="end" sx={{ ml: 0.5 }}>
                    <IconButton
                      aria-label={`Update amount of “${props.stock.name}” in portfolio`}
                      ref={updateAmountButtonRef}
                      size="small"
                      onClick={updateStockInPortfolio}
                      disabled={!!amountError || props.stock.amount === +amountInput}
                    >
                      <PublishedWithChangesIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                style: { paddingRight: 0 },
              }}
              inputProps={{
                inputMode: "decimal",
                type: "number",
                // Amount must be divisible by the currency's minor unit
                step: Math.pow(10, -1 * currencyMinorUnits[props.portfolio.currency]),
                min: Math.pow(10, -1 * currencyMinorUnits[props.portfolio.currency]), // Amount must be positive
                sx: { textAlign: "right" },
              }}
              onChange={(event) => {
                setAmountInput(event.target.value);
                // If in error state, check whether error is resolved. If so, clear the error.
                if (amountError && event.target.checkValidity()) setAmountError("");
              }}
              onInvalid={(event) => setAmountError((event.target as HTMLInputElement).validationMessage)}
              error={!!amountError}
              helperText={amountError}
              onBlur={(event) => {
                if ("amount" in props.stock && event.relatedTarget !== updateAmountButtonRef.current) {
                  setAmountInput(props.stock.amount.toFixed(currencyMinorUnits[props.portfolio.currency]));
                  // Clear the error message if the input is reset to the original value
                  setAmountError("");
                }
              }}
              inputRef={amountInputRef}
              required
              label="Amount"
              value={amountInput}
            />
          </Tooltip>
        </TableCell>
      )}
      {/* Name and Logo */}
      <TableCell>
        <Link
          component={NavLink}
          to={`${stocksAPIPath}/${encodeURIComponent(props.stock.ticker)}`}
          target="_blank"
          color="inherit"
          underline="none"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Badge
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            badgeContent={
              isFavorite ? (
                <Tooltip title="This stock is marked as a favorite" arrow>
                  <StarsIcon sx={{ width: 16, height: 16 }} color="warning" />
                </Tooltip>
              ) : undefined
            }
            overlap="circular"
          >
            <Avatar
              sx={{ width: 56, height: 56, m: "-8px", background: "none" }}
              src={
                `${baseURL}${stocksAPIPath}/${encodeURIComponent(props.stock.ticker)}${stockLogoEndpointSuffix}` +
                `?dark=${theme.palette.mode === "dark"}`
              }
              alt={`Logo of “${props.stock.name}”`}
              slotProps={{ img: { loading: "lazy" } }}
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
        </Link>
      </TableCell>
      {/* Country and Region */}
      <TableCell sx={{ display: displayColumn("Country") }}>
        <Typography variant="body1" fontWeight="bold" color="text.primary" width={125} noWrap>
          {props.stock.country && countryNameWithFlag[props.stock.country]}
        </Typography>
        <Typography variant="body2" color="text.secondary" width={125} noWrap>
          {props.stock.country && regionName[regionOfCountry[props.stock.country]]}
        </Typography>
      </TableCell>
      {/* StyleBox */}
      <TableCell sx={{ display: displayColumn("Size and Style") }}>
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
      <TableCell sx={{ display: displayColumn("Sector") }}>
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
      <TableCell sx={{ display: displayColumn("Industry") }}>
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
      <TableCell sx={{ display: displayColumn("Total Score") }}>
        <BlueIconChip
          icon={<VerifiedIcon />}
          label={<strong>{Math.round(Math.max(0, 100 * props.stock.totalScore))}</strong>}
          sx={{ width: 84, fontSize: 18 }}
        />
      </TableCell>
      {/* Financial Score */}
      <TableCell sx={{ display: displayColumn("Financial Score") }}>
        <YellowIconChip
          icon={<PriceCheckIcon />}
          label={<strong>{Math.round(Math.max(0, 100 * props.stock.financialScore))}</strong>}
          sx={{ width: 84, fontSize: 18 }}
        />
      </TableCell>
      {/* ESG Score */}
      <TableCell sx={{ display: displayColumn("ESG Score") }}>
        <GreenIconChip
          icon={<NaturePeopleIcon />}
          label={<strong>{Math.round(Math.max(0, 100 * props.stock.esgScore))}</strong>}
          sx={{ width: 84, fontSize: 18 }}
        />
      </TableCell>
      {/* Morningstar Star Rating */}
      <TableCell sx={{ display: displayColumn("Star Rating") }}>
        <MorningstarNavigator stock={props.stock}>
          <StarRating value={props.stock.starRating} />
        </MorningstarNavigator>
      </TableCell>
      {/* Morningstar Fair Value */}
      <TableCell sx={{ display: displayColumn("Morningstar Fair Value") }}>
        <MorningstarNavigator stock={props.stock}>
          <Typography variant="body1" fontWeight="bold" color="text.primary" width={90} noWrap>
            <CurrencyWithTooltip value={props.stock.morningstarFairValue} currency={props.stock.currency} floatAlign />
          </Typography>
          <Typography variant="body2" color="text.secondary" width={90} sx={{ textAlign: "right" }} noWrap>
            {formatPercentage(props.stock.morningstarFairValuePercentageToLastClose, {
              total: 100,
              precision: 2,
              forceSign: true,
              fallbackString: "",
            })}
          </Typography>
        </MorningstarNavigator>
      </TableCell>
      {/* Analyst Ratings */}
      <TableCell sx={{ display: displayColumn("Analyst Ratings") }}>
        {props.stock.analystConsensus !== null && props.stock.analystRatings && (
          <MarketScreenerNavigator stock={props.stock}>
            <AnalystRatingBar stock={props.stock} width={120} open={displayColumn("Analyst Ratings") !== "none"} />
          </MarketScreenerNavigator>
        )}
      </TableCell>
      {/* Analyst Target Price */}
      <TableCell sx={{ display: displayColumn("Analyst Target Price") }}>
        <MarketScreenerNavigator stock={props.stock}>
          <Typography
            variant="body1"
            fontWeight="bold"
            color="text.primary"
            sx={{ opacity: props.stock.analystCount < 10 ? props.stock.analystCount / 10 : 1 }}
            width={90}
            noWrap
          >
            <CurrencyWithTooltip value={props.stock.analystTargetPrice} currency={props.stock.currency} floatAlign />
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            width={40}
            sx={{ textAlign: "left", display: "inline-block" }}
            noWrap
          >
            {props.stock.analystCount !== null && `n\u2009=\u2009${props.stock.analystCount}`}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            width={50}
            sx={{ textAlign: "right", display: "inline-block" }}
            noWrap
          >
            {props.stock.analystCount !== null &&
              formatPercentage(props.stock.analystTargetPricePercentageToLastClose, {
                total: 100,
                precision: 2,
                forceSign: true,
                fallbackString: "",
              })}
          </Typography>
        </MarketScreenerNavigator>
      </TableCell>
      {/* MSCI ESG Rating */}
      <TableCell sx={{ display: displayColumn("MSCI ESG Rating") }}>
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
      <TableCell sx={{ display: displayColumn("MSCI Implied Temperature Rise") }}>
        {props.stock.msciTemperature !== null && (
          <MSCINavigator stock={props.stock}>
            <TemperatureChip
              msciTemperature={props.stock.msciTemperature}
              icon={<ThermostatIcon />}
              label={<strong>{props.stock.msciTemperature + "\u2009℃"}</strong>}
              size="small"
              sx={{ width: 75 }}
              style={{ cursor: "inherit" }}
            />
          </MSCINavigator>
        )}
      </TableCell>
      {/* LSEG */}
      <TableCell sx={{ display: displayColumn("LSEG ESG Information") }}>
        <LSEGNavigator stock={props.stock}>
          <Box sx={{ minWidth: 90, display: "flex", alignItems: "center" }}>
            <Typography
              variant="body1"
              fontWeight="bold"
              color="text.primary"
              width={45}
              fontSize={18}
              sx={{ textAlign: "left", display: "inline-block" }}
              noWrap
            >
              {props.stock.lsegESGScore}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              width={45}
              fontSize={18}
              sx={{ textAlign: "right", display: "inline-block" }}
              noWrap
            >
              {props.stock.lsegEmissions}
            </Typography>
          </Box>
        </LSEGNavigator>
      </TableCell>
      {/* S&P ESG Score */}
      <TableCell sx={{ display: displayColumn("S&P ESG Score") }}>
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
      <TableCell sx={{ display: displayColumn("Sustainalytics ESG Risk") }}>
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
      <TableCell sx={{ display: displayColumn("52 Week Range") }}>
        {props.stock.lastClose !== null && props.stock.low52w !== null && props.stock.high52w !== null && (
          <Range52WSlider stock={props.stock} width={150} />
        )}
      </TableCell>
      {/* Sparkline */}
      <TableCell sx={{ display: displayColumn("Sparkline") }}>
        <Sparkline stock={props.stock} width={120} height={42} />
      </TableCell>
      {/* Dividend Yield */}
      <TableCell sx={{ display: displayColumn("Dividend Yield (%)") }}>
        <Typography variant="body1" color="text.primary" width={45} sx={{ textAlign: "right" }} noWrap>
          {formatPercentage(props.stock.dividendYieldPercent, { total: 100 })}
        </Typography>
      </TableCell>
      {/* P/E Ratio */}
      <TableCell sx={{ display: displayColumn("P / E Ratio") }}>
        <Typography variant="body1" color="text.primary" width={45} sx={{ textAlign: "right" }} noWrap>
          {Number(props.stock.priceEarningRatio?.toPrecision(3)) || "–"}
        </Typography>
      </TableCell>
      {/* Market Cap */}
      <TableCell sx={{ display: displayColumn("Market Capitalization") }}>
        <Typography variant="body1" color="text.primary" width={75} noWrap>
          <Tooltip title={props.stock.currency && currencyName[props.stock.currency]} arrow>
            <Box sx={{ float: "left" }} display="inline-block">
              {props.stock.currency ?? ""}
            </Box>
          </Tooltip>
          <Box sx={{ float: "right" }}>{formatMarketCap(props.stock)}</Box>
        </Typography>
      </TableCell>
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen}>
        <EditStock stock={props.stock} onCloseAfterEdit={props.getStocks} onClose={() => setEditDialogOpen(false)} />
      </Dialog>
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DeleteStock stock={props.stock} onDelete={props.getStocks} onClose={() => setDeleteDialogOpen(false)} />
      </Dialog>
      {props.watchlist ? (
        <Dialog open={removeFromWatchlistDialogOpen} onClose={() => setRemoveFromWatchlistDialogOpen(false)}>
          {/* Remove from Watchlist Dialog */}
          <RemoveStockFromWatchlist
            stock={props.stock}
            watchlist={props.watchlist}
            onRemove={() => (props.getWatchlist(), props.getStocks())}
            onClose={() => setRemoveFromWatchlistDialogOpen(false)}
          />
        </Dialog>
      ) : (
        <Dialog maxWidth="xs" open={addToWatchlistDialogOpen} onClose={() => setAddToWatchlistDialogOpen(false)}>
          {/* Add to Watchlist Dialog */}
          <AddStockToWatchlist stock={props.stock} onClose={() => setAddToWatchlistDialogOpen(false)} />
        </Dialog>
      )}
      {props.portfolio && "id" in props.portfolio ? (
        <Dialog open={removeFromPortfolioDialogOpen} onClose={() => setRemoveFromPortfolioDialogOpen(false)}>
          {/* Remove from Portfolio Dialog */}
          <RemoveStockFromPortfolio
            stock={props.stock}
            portfolio={props.portfolio}
            onRemove={() => (props.getPortfolio(), props.getStocks())}
            onClose={() => setRemoveFromPortfolioDialogOpen(false)}
          />
        </Dialog>
      ) : (
        <Dialog maxWidth="xs" open={addToPortfolioDialogOpen} onClose={() => setAddToPortfolioDialogOpen(false)}>
          {/* Add to Portfolio Dialog */}
          <AddStockToPortfolio stock={props.stock} onClose={() => setAddToPortfolioDialogOpen(false)} />
        </Dialog>
      )}
    </TableRow>
  ) : (
    // Skeleton of a stock row
    <TableRow hover sx={{ height: 59 }} {...(props.isInfiniteLoadingTrigger ? { ref: infiniteLoadingTriggerRef } : {})}>
      {/* Actions */}
      {props.hideActionsMenu ? (
        <TableCell sx={{ p: 0.25 }} />
      ) : (
        <TableCell style={{ whiteSpace: "nowrap" }}>
          <Skeleton
            sx={{ m: "4px", display: "inline-block", verticalAlign: "middle" }}
            variant="circular"
            width={2 * (theme.typography.body1.fontSize as number) - 4}
            height={2 * (theme.typography.body1.fontSize as number) - 4}
          />
        </TableCell>
      )}
      {props.portfolio !== undefined && (
        <TableCell>
          <Skeleton variant="rounded" width={150} height={32} />
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
      <TableCell sx={{ display: displayColumn("Country") }}>
        <Typography variant="body1">
          <Skeleton width={125} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width={125} />
        </Typography>
      </TableCell>
      {/* Size|Style */}
      <TableCell sx={{ display: displayColumn("Size and Style") }}>
        <Skeleton
          variant="rectangular"
          width={2.75 * (theme.typography.body1.fontSize as number)}
          height={2.75 * (theme.typography.body1.fontSize as number)}
        />
      </TableCell>
      {/* Sector */}
      <TableCell sx={{ display: displayColumn("Sector") }}>
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
            sx={{ m: `${0.1 * (theme.typography.body1.fontSize as number)}px` }}
          />
          <Box width={6} />
          <Skeleton width={105} />
        </Typography>
      </TableCell>
      {/* Industry */}
      <TableCell sx={{ display: displayColumn("Industry") }}>
        <Typography variant="body1">
          <Skeleton width={150} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width={150} />
        </Typography>
      </TableCell>
      {/* Scores */}
      <TableCell sx={{ display: displayColumn("Total Score") }}>
        <Skeleton variant="rounded" width={84} height={32} />
      </TableCell>
      <TableCell sx={{ display: displayColumn("Financial Score") }}>
        <Skeleton variant="rounded" width={84} height={32} />
      </TableCell>
      <TableCell sx={{ display: displayColumn("ESG Score") }}>
        <Skeleton variant="rounded" width={84} height={32} />
      </TableCell>
      {/* Star Rating */}
      <TableCell sx={{ display: displayColumn("Star Rating") }}>
        <Box sx={{ whiteSpace: "nowrap" }}>
          {[...Array(5).keys()].map((index) => {
            return (
              <Skeleton
                key={index}
                sx={{ m: "2px", display: "inline-block", verticalAlign: "middle" }}
                variant="circular"
                width={20}
                height={20}
              />
            );
          })}
        </Box>
      </TableCell>
      {/* Fair Value */}
      <TableCell sx={{ display: displayColumn("Morningstar Fair Value") }}>
        <Typography variant="body1">
          <Skeleton width={90} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width={90} />
        </Typography>
      </TableCell>
      {/* Analyst Ratings */}
      <TableCell sx={{ display: displayColumn("Analyst Ratings") }}>
        <Skeleton variant="rounded" width={120} height={42} />
      </TableCell>
      {/* Analyst Target */}
      <TableCell sx={{ display: displayColumn("Analyst Target Price") }}>
        <Typography variant="body1">
          <Skeleton width={90} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width={90} />
        </Typography>
      </TableCell>
      {/* MSCI ESG */}
      <TableCell sx={{ display: displayColumn("MSCI ESG Rating") }}>
        <Skeleton variant="rounded" width={48} height={24} />
      </TableCell>
      {/* MSCI Temp */}
      <TableCell sx={{ display: displayColumn("MSCI Implied Temperature Rise") }}>
        <Skeleton variant="rounded" width={75} height={24} />
      </TableCell>
      {/* LSEG + Emissions */}
      <TableCell sx={{ display: displayColumn("LSEG ESG Information") }}>
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
      <TableCell sx={{ display: displayColumn("S&P ESG Score") }}>
        <Typography variant="body1" fontSize={18}>
          <Skeleton width={48} />
        </Typography>
      </TableCell>
      {/* Sustainalytics ESG Risk */}
      <TableCell sx={{ display: displayColumn("Sustainalytics ESG Risk") }}>
        <Skeleton variant="rounded" width={64} height={24} />
      </TableCell>
      {/* 52 Week Range */}
      <TableCell sx={{ display: displayColumn("52 Week Range") }}>
        <Skeleton variant="rectangular" width={150} height={42} />
      </TableCell>
      {/* Sparkline */}
      <TableCell sx={{ display: displayColumn("Sparkline") }}>
        <Skeleton variant="rounded" width={120} height={42} />
      </TableCell>
      {/* Div Yield */}
      <TableCell sx={{ display: displayColumn("Dividend Yield (%)") }}>
        <Typography variant="body1">
          <Skeleton width={45} />
        </Typography>
      </TableCell>
      {/* P/E */}
      <TableCell sx={{ display: displayColumn("P / E Ratio") }}>
        <Typography variant="body1">
          <Skeleton width={45} />
        </Typography>
      </TableCell>
      {/* Market Cap */}
      <TableCell sx={{ display: displayColumn("Market Capitalization") }}>
        <Typography variant="body1">
          <Skeleton width={75} />
        </Typography>
      </TableCell>
    </TableRow>
  );
};

/**
 * This memoized component displays information about a stock in a table row that is used in the stock list.
 * @param props The properties of the component.
 * @returns The component.
 */
export const MemoizedStockRow = memo(StockRow);

/**
 * Properties for the StockRow component
 */
interface StockRowProps {
  /**
   * The stock to display. If unset, a skeleton of a stock row is shown.
   */
  stock?: Stock | WeightedStock;
  /**
   * Whether the stock row is a trigger for infinite loading, which will be executed when the stock row is visible.
   */
  isInfiniteLoadingTrigger?: boolean;
  /**
   * A watchlist the stock is in. If set, the stock row is shown as part of that watchlist’s stocks.
   */
  watchlist?: WatchlistSummary;
  /**
   * A portfolio the stock is in. If set, the stock row is shown as part of that portfolio’s stocks.
   */
  portfolio?: PortfolioSummary | PortfolioRawData;
  /**
   * A method to update the stock list, e.g. after a stock was modified or deleted.
   *
   * If this is a regular stock row, this method will update all stocks currently present in the stock table without
   * changing the total number of stocks present.
   * If this stock row is the trigger for infinite loading, this method will fetch more stocks from the server and
   * append them to the stock table.
   */
  getStocks?: () => void;
  /**
   * A method to update the watchlist, e.g. after a stock was added to or removed from the watchlist.
   */
  getWatchlist?: () => void;
  /**
   * A method to update the portfolio, e.g. after a stock was added to, modified within or removed from the portfolio.
   */
  getPortfolio?: () => void;
  /**
   * The columns to display
   */
  columns?: StockListColumn[];
  /**
   * Whether to hide the actions context menu.
   */
  hideActionsMenu?: boolean;
}
