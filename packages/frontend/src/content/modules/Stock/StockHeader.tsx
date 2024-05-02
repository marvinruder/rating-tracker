import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import { Box, Grid, Typography, Dialog, IconButton, Skeleton, Avatar, useTheme, Tooltip } from "@mui/material";
import type { Stock } from "@rating-tracker/commons";
import {
  baseURL,
  favoritesEndpointPath,
  stockLogoEndpointSuffix,
  stocksEndpointPath,
  WRITE_STOCKS_ACCESS,
} from "@rating-tracker/commons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { AddStockToPortfolio } from "../../../components/dialogs/portfolio/AddStockToPortfolio";
import { DeleteStock } from "../../../components/dialogs/stock/DeleteStock";
import { EditStock } from "../../../components/dialogs/stock/EditStock";
import { AddStockToWatchlist } from "../../../components/dialogs/watchlist/AddStockToWatchlist";
import { useFavoritesContextUpdater } from "../../../contexts/FavoritesContext";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import { useUserContextState } from "../../../contexts/UserContext";
import api from "../../../utils/api";

/**
 * A header for the stock details page.
 * @param props The properties of the component.
 * @returns The component.
 */
export const StockHeader = (props: StockHeaderProps): JSX.Element => {
  const [addToWatchlistDialogOpen, setAddToWatchlistDialogOpen] = useState<boolean>(false);
  const [addToPortfolioDialogOpen, setAddToPortfolioDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);

  // Close the dialogs when the stock changes (e.g. by navigating to another stock using the search bar)
  useEffect(() => {
    setAddToWatchlistDialogOpen(false);
    setAddToPortfolioDialogOpen(false);
    setDeleteDialogOpen(false);
    setEditDialogOpen(false);
  }, [props.stock?.ticker]);

  const { user } = useUserContextState();
  const { refetchFavorites } = useFavoritesContextUpdater();
  const theme = useTheme();
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  const navigate = useNavigate();

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center" rowGap={1}>
        <Grid item sx={{ display: "flex", alignItems: "center" }}>
          {props.stock ? ( // Actual header with logo and name
            <>
              <Avatar
                sx={{ width: 112, height: 112, m: "-16px", mr: "-8px", background: "none" }}
                src={`${baseURL}${stocksEndpointPath}/${props.stock.ticker}${stockLogoEndpointSuffix}?dark=${
                  theme.palette.mode === "dark"
                }`}
                alt={`Logo of “${props.stock.name}”`}
              />
              <Box>
                <Typography variant="h3" component="h3" gutterBottom>
                  {props.stock.name}
                </Typography>
                <Typography variant="subtitle2">
                  {props.stock.ticker} | {props.stock.isin}
                </Typography>
              </Box>
            </>
          ) : (
            // Skeleton
            <>
              <Skeleton variant="circular" width={56} height={56} sx={{ m: "12px", mr: "20px" }} />
              <Box>
                <Typography variant="h3">
                  <Skeleton width={240} />
                </Typography>
                <Typography variant="subtitle2">
                  <Skeleton width={120} />
                </Typography>
              </Box>
            </>
          )}
        </Grid>
        <Grid item ml="auto" height={40}>
          {props.stock ? (
            <Tooltip arrow title={props.isFavorite ? "Remove from favorites" : "Add to favorites"}>
              <Box display="inline-block" ml={1}>
                <IconButton
                  color={props.isFavorite ? "warning" : undefined}
                  onClick={() => {
                    (props.isFavorite ? api.delete : api.put)(favoritesEndpointPath + `/${props.stock.ticker}`)
                      .then(refetchFavorites)
                      .catch((e) =>
                        setErrorNotificationOrClearSession(
                          e,
                          props.isFavorite
                            ? `removing “${props.stock.name}” from favorites`
                            : `adding “${props.stock.name}” to favorites`,
                        ),
                      );
                  }}
                >
                  {props.isFavorite ? <StarIcon /> : <StarOutlineIcon />}
                </IconButton>
              </Box>
            </Tooltip>
          ) : (
            <Skeleton variant="rounded" width={40} height={40} sx={{ display: "inline-block", ml: 1 }} />
          )}
          {props.stock ? (
            <Tooltip arrow title="Add to watchlist">
              <Box display="inline-block" ml={1}>
                <IconButton color="success" onClick={() => setAddToWatchlistDialogOpen(true)}>
                  <BookmarkAddIcon />
                </IconButton>
              </Box>
            </Tooltip>
          ) : (
            <Skeleton variant="rounded" width={40} height={40} sx={{ display: "inline-block", ml: 1 }} />
          )}
          {props.stock ? (
            <Tooltip arrow title="Add to portfolio">
              <Box display="inline-block" ml={1}>
                <IconButton color="success" onClick={() => setAddToPortfolioDialogOpen(true)}>
                  <AddShoppingCartIcon />
                </IconButton>
              </Box>
            </Tooltip>
          ) : (
            <Skeleton variant="rounded" width={40} height={40} sx={{ display: "inline-block", ml: 1 }} />
          )}
          {props.stock ? (
            <Tooltip
              arrow
              title={
                user.hasAccessRight(WRITE_STOCKS_ACCESS)
                  ? "Edit Stock"
                  : "You do not have the necessary access rights to update stocks."
              }
            >
              <Box display="inline-block" ml={1}>
                <IconButton
                  color="primary"
                  onClick={() => setEditDialogOpen(true)}
                  disabled={!user.hasAccessRight(WRITE_STOCKS_ACCESS)}
                >
                  <EditIcon />
                </IconButton>
              </Box>
            </Tooltip>
          ) : (
            <Skeleton variant="rounded" width={40} height={40} sx={{ display: "inline-block", ml: 1 }} />
          )}
          {props.stock ? (
            <Tooltip
              arrow
              title={
                user.hasAccessRight(WRITE_STOCKS_ACCESS)
                  ? "Delete Stock"
                  : "You do not have the necessary access rights to delete stocks."
              }
            >
              <Box display="inline-block" ml={1}>
                <IconButton
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={!user.hasAccessRight(WRITE_STOCKS_ACCESS)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Tooltip>
          ) : (
            <Skeleton variant="rounded" width={40} height={40} sx={{ display: "inline-block", ml: 1 }} />
          )}
        </Grid>
      </Grid>
      {props.stock && (
        <>
          <Dialog maxWidth="xs" open={addToWatchlistDialogOpen} onClose={() => setAddToWatchlistDialogOpen(false)}>
            <AddStockToWatchlist stock={props.stock} onClose={() => setAddToWatchlistDialogOpen(false)} />
          </Dialog>
          <Dialog maxWidth="xs" open={addToPortfolioDialogOpen} onClose={() => setAddToPortfolioDialogOpen(false)}>
            <AddStockToPortfolio stock={props.stock} onClose={() => setAddToPortfolioDialogOpen(false)} />
          </Dialog>
          <Dialog open={editDialogOpen}>
            <EditStock
              stock={props.stock}
              onCloseAfterEdit={(newTicker) =>
                newTicker ? navigate(`${stocksEndpointPath}/${newTicker}`) : props.getStock()
              }
              onClose={() => setEditDialogOpen(false)}
            />
          </Dialog>
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DeleteStock
              stock={props.stock}
              onDelete={() => navigate(stocksEndpointPath)}
              onClose={() => setDeleteDialogOpen(false)}
            />
          </Dialog>
        </>
      )}
    </>
  );
};

/**
 * The properties of the StockHeader component.
 */
interface StockHeaderProps {
  /**
   * The stock to display.
   */
  stock?: Stock;
  /**
   * Whether the stock is a favorite stock of the user.
   */
  isFavorite?: boolean;
  /**
   * A method to update the stock, e.g. after editing.
   */
  getStock?: () => void;
}
