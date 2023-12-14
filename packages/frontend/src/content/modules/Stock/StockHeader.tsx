import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import { Box, Grid, Typography, Dialog, IconButton, Skeleton, Avatar, useTheme, Tooltip } from "@mui/material";
import {
  baseURL,
  favoritesEndpointPath,
  Stock,
  stockLogoEndpointSuffix,
  stocksEndpointPath,
  WRITE_STOCKS_ACCESS,
} from "@rating-tracker/commons";
import { useContext, useState } from "react";

import { AddStockToPortfolio } from "../../../components/dialogs/portfolio/AddStockToPortfolio";
import { DeleteStock } from "../../../components/dialogs/stock/DeleteStock";
import { EditStock } from "../../../components/dialogs/stock/EditStock";
import { AddStockToWatchlist } from "../../../components/dialogs/watchlist/AddStockToWatchlist";
import { useNotification } from "../../../contexts/NotificationContext";
import { UserContext } from "../../../router";
import api from "../../../utils/api";

/**
 * A header for the stock details page.
 *
 * @param {StockHeaderProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const StockHeader = (props: StockHeaderProps): JSX.Element => {
  const [addToWatchlistDialogOpen, setAddToWatchlistDialogOpen] = useState<boolean>(false);
  const [addToPortfolioDialogOpen, setAddToPortfolioDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);

  const { user } = useContext(UserContext);
  const theme = useTheme();
  const { setNotification } = useNotification();

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item sx={{ display: "flex", alignItems: "center" }}>
          {props.stock ? ( // Actual header with logo and name
            <>
              <Avatar
                sx={{
                  width: 112,
                  height: 112,
                  m: "-16px",
                  mr: "-8px",
                  background: "none",
                }}
                src={`${baseURL}${stocksEndpointPath}/${props.stock.ticker}${stockLogoEndpointSuffix}?dark=${
                  theme.palette.mode === "dark"
                }`}
                alt=" "
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
              <Skeleton
                variant="circular"
                width={56}
                height={56}
                sx={{
                  m: "12px",
                  mr: "20px",
                }}
              />
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
        <Grid item ml="auto" mt={1} height={40}>
          {props.stock ? (
            <Tooltip arrow title={props.isFavorite ? "Remove from favorites" : "Add to favorites"}>
              <Box display="inline-block" ml={1}>
                <IconButton
                  color={props.isFavorite ? "warning" : undefined}
                  onClick={() => {
                    (props.isFavorite ? api.delete : api.put)(favoritesEndpointPath + `/${props.stock.ticker}`)
                      .then(() => props.getStock && props.getStock())
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
      <Dialog maxWidth="xs" open={addToWatchlistDialogOpen} onClose={() => setAddToWatchlistDialogOpen(false)}>
        <AddStockToWatchlist stock={props.stock} onClose={() => setAddToWatchlistDialogOpen(false)} />
      </Dialog>
      <Dialog maxWidth="xs" open={addToPortfolioDialogOpen} onClose={() => setAddToPortfolioDialogOpen(false)}>
        <AddStockToPortfolio stock={props.stock} onClose={() => setAddToPortfolioDialogOpen(false)} />
      </Dialog>
      <Dialog open={editDialogOpen} onClose={() => (setEditDialogOpen(false), props.getStock && props.getStock())}>
        <EditStock stock={props.stock} getStocks={props.getStock} onClose={() => setEditDialogOpen(false)} />
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DeleteStock stock={props.stock} onClose={() => setDeleteDialogOpen(false)} navigateTo={stocksEndpointPath} />
      </Dialog>
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
