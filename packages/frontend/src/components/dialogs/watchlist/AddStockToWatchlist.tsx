import AddIcon from "@mui/icons-material/Add";
import StarsIcon from "@mui/icons-material/Stars";
import {
  DialogTitle,
  Typography,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Tooltip,
  Skeleton,
  Dialog,
  useTheme,
} from "@mui/material";
import type { Stock, WatchlistSummary } from "@rating-tracker/commons";
import { FAVORITES_NAME, pluralize, stocksAPIPath, watchlistsAPIPath } from "@rating-tracker/commons";
import { Fragment, useEffect, useState } from "react";

import { useFavoritesContextUpdater } from "../../../contexts/FavoritesContext";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

import { AddWatchlist } from "./AddWatchlist";

/**
 * A dialog to add a stock to a watchlist.
 * @param props The properties of the component.
 * @returns The component.
 */
export const AddStockToWatchlist = (props: AddStockToWatchlistProps): JSX.Element => {
  const [watchlistSummaries, setWatchlistSummaries] = useState<WatchlistSummary[]>([]);
  const [watchlistSummariesFinal, setWatchlistSummariesFinal] = useState<boolean>(false);
  const [addWatchlistOpen, setAddWatchlistOpen] = useState<boolean>(false);
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();
  const { refetchFavorites } = useFavoritesContextUpdater();

  const theme = useTheme();

  useEffect(() => getWatchlists(), []);

  /**
   * Get the watchlists from the backend.
   */
  const getWatchlists = () => {
    api
      .get(watchlistsAPIPath)
      .then((res) => setWatchlistSummaries(res.data))
      .catch((e) => {
        setErrorNotificationOrClearSession(e, "fetching watchlists");
        setWatchlistSummaries([]);
      })
      .finally(() => setWatchlistSummariesFinal(true));
  };

  const watchlistsAlreadyContainingStock: number[] = watchlistSummaries
    .filter((watchlist) => watchlist.stocks.map((stock) => stock.ticker).includes(props.stock.ticker))
    .map((watchlist) => watchlist.id);

  /**
   * Adds the stock to the watchlist.
   * @param id The ID of the watchlist.
   */
  const addStockToWatchlist = (id: number) => {
    api
      .put(`${watchlistsAPIPath}/${id}${stocksAPIPath}/${encodeURIComponent(props.stock.ticker)}`)
      .then(() => {
        if (watchlistSummaries.find((watchlistSummary) => watchlistSummary.id === id)?.name === FAVORITES_NAME)
          refetchFavorites();
        props.onClose();
      })
      .catch((e) => setErrorNotificationOrClearSession(e, "adding stock to watchlist"));
  };

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Add Stock “{props.stock.name}” to Watchlist</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" mb={1}>
          Select the watchlist you want to add the stock to:
        </Typography>
        <List
          disablePadding
          sx={{
            " > li.MuiListItem-root": { borderTop: `1px solid ${theme.palette.divider}` },
            " > li.MuiListItem-root:last-child": { borderBottom: `1px solid ${theme.palette.divider}` },
          }}
        >
          {watchlistSummariesFinal
            ? watchlistSummaries.map((watchlistSummary) => (
                <Fragment key={watchlistSummary.id}>
                  <ListItem disablePadding disableGutters>
                    <ListItemButton
                      onClick={() => addStockToWatchlist(watchlistSummary.id)}
                      disabled={watchlistsAlreadyContainingStock.includes(watchlistSummary.id)}
                    >
                      {watchlistSummary?.name === FAVORITES_NAME && (
                        <ListItemIcon>
                          <Tooltip title="This is your Favorites watchlist." arrow>
                            <StarsIcon color="warning" />
                          </Tooltip>
                        </ListItemIcon>
                      )}
                      <ListItemText
                        inset={watchlistSummary?.name !== FAVORITES_NAME}
                        primary={watchlistSummary.name}
                        primaryTypographyProps={{ fontWeight: "bold" }}
                        secondary={
                          watchlistsAlreadyContainingStock.includes(watchlistSummary.id)
                            ? `This watchlist already contains “${props.stock.name}”.`
                            : (watchlistSummary.stocks.length || "No") +
                              ` stock${pluralize(watchlistSummary.stocks.length)}`
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                </Fragment>
              ))
            : [...Array(3)].map(
                // Render skeleton rows
                (_, key) => (
                  <Fragment key={key}>
                    <ListItem disablePadding disableGutters>
                      <ListItemButton>
                        <ListItemText
                          inset
                          primary={<Skeleton width="160px" />}
                          secondary={<Skeleton width="48px" />}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Fragment>
                ),
              )}
          <ListItem disablePadding disableGutters>
            <ListItemButton onClick={() => setAddWatchlistOpen(true)}>
              <ListItemIcon>
                <AddIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Create a new watchlist…" primaryTypographyProps={{ fontWeight: "bold" }} />
            </ListItemButton>
          </ListItem>
        </List>
        <Dialog maxWidth="lg" open={addWatchlistOpen} onClose={() => setAddWatchlistOpen(false)}>
          <AddWatchlist onClose={() => setAddWatchlistOpen(false)} onAdd={getWatchlists} />
        </Dialog>
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={props.onClose} sx={{ mr: "auto" }}>
          Cancel
        </Button>
      </DialogActions>
    </>
  );
};

/**
 * Properties for the AddStockToWatchlist component.
 */
interface AddStockToWatchlistProps {
  /**
   * The stock to add.
   */
  stock: Stock;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
}
