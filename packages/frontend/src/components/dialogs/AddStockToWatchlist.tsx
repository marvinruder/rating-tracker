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
  Divider,
  Tooltip,
  Skeleton,
  Dialog,
} from "@mui/material";
import {
  FAVORITES_NAME,
  Stock,
  WatchlistSummary,
  watchlistEndpointPath,
  watchlistSummaryEndpointPath,
} from "@rating-tracker/commons";
import React, { Fragment, useEffect, useState } from "react";

import { useNotification } from "../../contexts/NotificationContext";
import api from "../../utils/api";

import { AddWatchlist } from "./AddWatchlist";

/**
 * A dialog to add a stock to a watchlist.
 *
 * @param {AddStockToWatchlistProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const AddStockToWatchlist = (props: AddStockToWatchlistProps): JSX.Element => {
  const [watchlistSummaries, setWatchlistSummaries] = useState<WatchlistSummary[]>([]);
  const [watchlistsAlreadyContainingStock, setWatchlistsAlreadyContainingStock] = useState<number[]>([]);
  const [watchlistSummariesFinal, setWatchlistSummariesFinal] = useState<boolean>(false);
  const [addWatchlistOpen, setAddWatchlistOpen] = useState<boolean>(false);
  const { setErrorNotificationOrClearSession: setErrorNotification } = useNotification();

  useEffect(() => getWatchlists(), []);

  /**
   * Get the watchlists from the backend.
   */
  const getWatchlists = () => {
    api
      .get(watchlistSummaryEndpointPath)
      .then((res) => setWatchlistSummaries(res.data))
      .catch((e) => {
        setErrorNotification(e, "fetching watchlists");
        setWatchlistSummaries([]);
      })
      .finally(() => setWatchlistSummariesFinal(true));
  };

  useEffect(() => {
    setWatchlistsAlreadyContainingStock(
      watchlistSummaries
        .filter((watchlist) => watchlist.stocks.map((stock) => stock.ticker).includes(props.stock.ticker))
        .map((watchlist) => watchlist.id),
    );
  }, [watchlistSummaries]);

  /**
   * Adds the stock to the watchlist.
   *
   * @param {number} id The ID of the watchlist.
   */
  const addStockToWatchlist = (id: number) => {
    api
      .patch(watchlistEndpointPath + `/${id}`, {}, { params: { stocksToAdd: [props.stock.ticker] } })
      .then(() => props.onClose())
      .catch((e) => setErrorNotification(e, "adding stock to watchlist"));
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
        <List disablePadding>
          {watchlistSummariesFinal
            ? watchlistSummaries.map((watchlistSummary) => (
                <Fragment key={watchlistSummary.id}>
                  <Divider />
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
                        primaryTypographyProps={{ variant: "body1", fontWeight: "bold", color: "text.primary" }}
                        secondary={
                          watchlistsAlreadyContainingStock.includes(watchlistSummary.id)
                            ? `This watchlist already contains “${props.stock.name}”.`
                            : (watchlistSummary.stocks.length || "No") +
                              ` stock${watchlistSummary.stocks.length !== 1 ? "s" : ""}`
                        }
                        secondaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Fragment>
              ))
            : [...Array(3)].map(
                (
                  _,
                  key, // Render skeleton rows
                ) => (
                  <Fragment key={key}>
                    <Divider />
                    <ListItem disablePadding disableGutters>
                      <ListItemButton>
                        <ListItemText
                          inset
                          primary={<Skeleton width="160px" />}
                          primaryTypographyProps={{ variant: "body1", fontWeight: "bold", color: "text.primary" }}
                          secondary={<Skeleton width="48px" />}
                          secondaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Fragment>
                ),
              )}
          <Divider />
          <ListItem disablePadding disableGutters>
            <ListItemButton onClick={() => setAddWatchlistOpen(true)}>
              <ListItemIcon>
                <AddIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Create a new watchlist…"
                primaryTypographyProps={{ variant: "body1", fontWeight: "bold", color: "text.primary" }}
              />
            </ListItemButton>
          </ListItem>
          <Divider />
        </List>
        <Dialog maxWidth="lg" open={addWatchlistOpen} onClose={() => setAddWatchlistOpen(false)}>
          <AddWatchlist onClose={() => (setAddWatchlistOpen(false), getWatchlists())} />
        </Dialog>
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={props.onClose}>Cancel</Button>
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
