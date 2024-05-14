import { Button, DialogActions, Divider, Grid, InputAdornment, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import {
  portfoliosAPIPath,
  watchlistsAPIPath,
  type PortfolioSummary,
  type WatchlistSummary,
  stocksAPIPath,
  currencyMinorUnits,
  FAVORITES_NAME,
} from "@rating-tracker/commons";
import { useState } from "react";

import { useFavoritesContextUpdater } from "../../../contexts/FavoritesContext";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

import SelectStock from "./SelectStock";

/**
 * A dialog to add a stock to a collection (portfolio or watchlist).
 * @param props The properties of the component.
 * @returns The component.
 */
const AddStockToCollection = (props: AddStockToCollectionProps): JSX.Element => {
  const [amountInput, setAmountInput] = useState<string>("");
  const [amountError, setAmountError] = useState<boolean>(false);
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();
  const { refetchFavorites } = useFavoritesContextUpdater();

  const isPortfolio = "currency" in props.collection;
  const isWatchlist = "subscribed" in props.collection;
  const collectionLabel = isPortfolio ? "Portfolio" : "Watchlist";
  const collectionsAPIPath = isPortfolio ? portfoliosAPIPath : watchlistsAPIPath;

  /**
   * Checks for errors in the input fields.
   * @returns Whether the input fields are valid.
   */
  const validate = (): boolean => {
    if (isPortfolio) {
      // The following fields are required.
      console.log(amountInput);
      setAmountError(!amountInput || Number.isNaN(+amountInput) || +amountInput <= 0);
      return !!amountInput && !Number.isNaN(+amountInput) && +amountInput > 0;
    }
    return true;
  };

  /**
   * Adds the stock to the collection.
   * @param ticker The ticker of the stock.
   */
  const addStockToCollection = (ticker: string) => {
    if (!validate()) return;
    api
      .put(`${collectionsAPIPath}/${props.collection.id}${stocksAPIPath}/${ticker}`, {
        params: isPortfolio ? { amount: +amountInput } : {},
      })
      .then(() => {
        props.onAdd();
        if (isWatchlist && props.collection.name === FAVORITES_NAME) refetchFavorites();
        props.onClose();
      })
      .catch((e) => setErrorNotificationOrClearSession(e, "adding stock to portfolio"));
  };

  return (
    <>
      <SelectStock
        titleElement={
          <Box pb={1}>
            <Typography variant="h3">
              Add Stock to {collectionLabel} “{props.collection.name}”
            </Typography>
            {"currency" in props.collection && ( // Required for type narrowing
              <Grid container spacing={1} my={1} maxWidth={600} alignItems="center">
                <Grid item xs={12}>
                  <TextField
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ width: 30, mt: "1px" }}>
                          {props.collection.currency}
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      inputMode: "decimal",
                      pattern: "\\d+(\\.\\d+)?",
                      step: Math.pow(10, -1 * currencyMinorUnits[props.collection.currency]),
                    }}
                    onChange={(event) => {
                      setAmountInput(event.target.value.replaceAll(/[^0-9.]/g, ""));
                      setAmountError(false);
                    }}
                    error={amountError}
                    label="Amount"
                    value={amountInput}
                    autoFocus
                    fullWidth
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        }
        title={`Select the stock you want to add to the ${collectionLabel.toLowerCase()}:`}
        onClose={props.onClose}
        onSelect={(stock) => addStockToCollection(stock.ticker)}
        validate={validate}
        disabledStocks={props.collection.stocks}
        stockDisabledReason={
          `The ${collectionLabel.toLowerCase()} ` + `“${props.collection.name}” already contains this stock.`
        }
      />
      <DialogActions sx={{ p: 2.6666, pt: 0, flexDirection: "column" }}>
        <Divider sx={{ mb: 1, width: "100%" }} />
        <Button onClick={props.onClose} sx={{ mr: "auto" }}>
          Cancel
        </Button>
      </DialogActions>
    </>
  );
};

interface AddStockToCollectionProps {
  /**
   * The collection to add the stock to.
   */
  collection: PortfolioSummary | WatchlistSummary;
  /**
   * A method that is called after the stock was added to the collection successfully.
   */
  onAdd: () => void;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
}

export default AddStockToCollection;
