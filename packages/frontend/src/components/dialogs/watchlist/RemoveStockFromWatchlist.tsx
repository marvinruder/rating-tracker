import BookmarkRemoveIcon from "@mui/icons-material/BookmarkRemove";
import LoadingButton from "@mui/lab/LoadingButton";
import { DialogTitle, Typography, DialogContent, DialogActions, Button } from "@mui/material";
import type { Stock, WatchlistSummary } from "@rating-tracker/commons";
import { FAVORITES_NAME, handleResponse } from "@rating-tracker/commons";
import { useState } from "react";

import watchlistClient from "../../../api/watchlist";
import { useFavoritesContextUpdater } from "../../../contexts/FavoritesContext";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";

/**
 * A dialog to remove a stock from a watchlist.
 * @param props The properties of the component.
 * @returns The component.
 */
export const RemoveStockFromWatchlist = (props: RemoveStockFromWatchlistProps): React.JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState(false);

  const { refetchFavorites } = useFavoritesContextUpdater();
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  /**
   * Removes the stock from the watchlist.
   */
  const removeStockFromWatchlist = () => {
    setRequestInProgress(true);
    watchlistClient[":id"].stocks[":ticker"]
      .$delete({ param: { id: String(props.watchlist.id), ticker: props.stock.ticker } })
      .then(handleResponse)
      .then(() => {
        if (props.watchlist.name === FAVORITES_NAME) refetchFavorites();
        props.onRemove();
        props.onClose();
      })
      .catch((e) => setErrorNotificationOrClearSession(e, "removing stock from watchlist"))
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
        <Button onClick={props.onClose} sx={{ mr: "auto" }}>
          Cancel
        </Button>
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
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
  /**
   * A method that is called after the stock was removed from the watchlist.
   */
  onRemove: () => void;
}
