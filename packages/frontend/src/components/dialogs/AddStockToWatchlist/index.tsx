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
import AddIcon from "@mui/icons-material/Add";
import StarsIcon from "@mui/icons-material/Stars";
import { Stock, WatchlistSummary, watchlistEndpointPath, watchlistSummaryEndpointPath } from "@rating-tracker/commons";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../router";
import { useNotification } from "../../../contexts/NotificationContext";
import AddWatchlist from "../AddWatchlist";

/**
 * A dialog to add a stock to a watchlist.
 *
 * @param {AddStockToWatchlistProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const AddStockToWatchlist = (props: AddStockToWatchlistProps): JSX.Element => {
  const [watchlistSummaries, setWatchlistSummaries] = useState<WatchlistSummary[]>([]);
  const [watchlistsAlreadyContainingStock, setWatchlistsAlreadyContainingStock] = useState<number[]>([]);
  const [watchlistSummariesFinal, setWatchlistSummariesFinal] = useState<boolean>(false);
  const [addWatchlistOpen, setAddWatchlistOpen] = useState<boolean>(false);
  const { setNotification } = useNotification();

  useEffect(() => getWatchlists(), []);

  /**
   * Get the watchlists from the backend.
   */
  const getWatchlists = () => {
    axios
      .get(baseUrl + watchlistSummaryEndpointPath)
      .then((res) => setWatchlistSummaries(res.data))
      .catch((e) => {
        setNotification({
          severity: "error",
          title: "Error while fetching watchlists",
          message:
            e.response?.status && e.response?.data?.message
              ? `${e.response.status}: ${e.response.data.message}`
              : e.message ?? "No additional information available.",
        });
        setWatchlistSummaries([]);
      })
      .finally(() => setWatchlistSummariesFinal(true));
  };

  useEffect(() => {
    setWatchlistsAlreadyContainingStock(
      watchlistSummaries
        .filter((watchlist) => watchlist.stocks.map((stock) => stock.ticker).includes(props.stock.ticker))
        .map((watchlist) => watchlist.id)
    );
  }, [watchlistSummaries]);

  /**
   * Adds the stock to the watchlist.
   *
   * @param {number} id The ID of the watchlist.
   */
  const addStockToWatchlist = (id: number) => {
    axios
      .patch(baseUrl + watchlistEndpointPath + `/${id}`, {}, { params: { stocksToAdd: [props.stock.ticker] } })
      .then(() => props.onClose())
      .catch((e) => {
        setNotification({
          severity: "error",
          title: "Error while adding stock to watchlist",
          message:
            e.response?.status && e.response?.data?.message
              ? `${e.response.status}: ${e.response.data.message}`
              : e.message ?? "No additional information available.",
        });
      });
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
                <React.Fragment key={watchlistSummary.id}>
                  <Divider />
                  <ListItem disablePadding disableGutters>
                    <ListItemButton
                      onClick={() => addStockToWatchlist(watchlistSummary.id)}
                      disabled={watchlistsAlreadyContainingStock.includes(watchlistSummary.id)}
                    >
                      {watchlistSummary?.name === "Favorites" && (
                        <ListItemIcon>
                          <Tooltip title="This is your Favorites watchlist." arrow>
                            <StarsIcon color="warning" />
                          </Tooltip>
                        </ListItemIcon>
                      )}
                      <ListItemText
                        inset={watchlistSummary?.name !== "Favorites"}
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
                </React.Fragment>
              ))
            : [...Array(3)].map(
                (
                  _,
                  key // Render skeleton rows
                ) => (
                  <React.Fragment key={key}>
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
                  </React.Fragment>
                )
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
      <DialogActions sx={{ p: 2.6666, pt: 0 }}>
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

export default AddStockToWatchlist;
