import BookmarkRemoveIcon from "@mui/icons-material/BookmarkRemove";
import LoadingButton from "@mui/lab/LoadingButton";
import { DialogTitle, Typography, DialogContent, DialogActions, Button } from "@mui/material";
import { Stock, WatchlistSummary, stocksEndpointPath, watchlistsEndpointPath } from "@rating-tracker/commons";
import { useState } from "react";

import { useNotification } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

/**
 * A dialog to remove a stock from a watchlist.
 *
 * @param {RemoveStockFromWatchlistProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const RemoveStockFromWatchlist = (props: RemoveStockFromWatchlistProps): JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState(false);

  const { setErrorNotificationOrClearSession: setErrorNotification } = useNotification();

  /**
   * Removes the stock from the watchlist.
   */
  const removeStockFromWatchlist = () => {
    setRequestInProgress(true),
      api
        .delete(watchlistsEndpointPath + `/${props.watchlist.id}` + stocksEndpointPath + `/${props.stock.ticker}`)
        .then(() => props.getWatchlist())
        .catch((e) => setErrorNotification(e, "removing stock from watchlist"))
        .finally(() => setRequestInProgress(false));
  };

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">
          Remove Stock “{props.stock.name}” from “{props.watchlist.name}”
        </Typography>
      </DialogTitle>
      <DialogContent>
        Do you really want to remove the Stock “{props.stock.name}” ({props.stock.ticker}) from the watchlist “
        {props.watchlist.name}”?
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={props.onClose}>Cancel</Button>
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={removeStockFromWatchlist}
          color="error"
          startIcon={<BookmarkRemoveIcon />}
        >
          Remove “{props.stock.ticker}”
        </LoadingButton>
      </DialogActions>
    </>
  );
};

/**
 * Properties for the RemoveStockFromWatchlist component.
 */
interface RemoveStockFromWatchlistProps {
  /**
   * The stock to remove.
   */
  stock: Stock;
  /**
   * The watchlist to remove the stock from
   */
  watchlist: WatchlistSummary;
  /**
   * A method to update the watchlist after the stock was removed.
   */
  getWatchlist: () => void;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
}