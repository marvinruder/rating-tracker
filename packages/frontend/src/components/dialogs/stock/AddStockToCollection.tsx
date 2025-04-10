import { Box, Button, DialogActions, Divider, Grid, InputAdornment, TextField, Typography } from "@mui/material";
import type { PortfolioSummary, WatchlistSummary } from "@rating-tracker/commons";
import { FAVORITES_NAME, currencyMinorUnits, handleResponse } from "@rating-tracker/commons";
import { useRef, useState } from "react";

import portfolioClient from "../../../api/portfolio";
import watchlistClient from "../../../api/watchlist";
import { useFavoritesContextUpdater } from "../../../contexts/FavoritesContext";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";

import SelectStock from "./SelectStock";

/**
 * A dialog to add a stock to a collection (portfolio or watchlist).
 * @param props The properties of the component.
 * @returns The component.
 */
const AddStockToCollection = (props: AddStockToCollectionProps): React.JSX.Element => {
  const [amountInput, setAmountInput] = useState<string>("");
  const [amountError, setAmountError] = useState<string>(""); // Error message for the amount text field.
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();
  const { refetchFavorites } = useFavoritesContextUpdater();

  const amountInputRef = useRef<HTMLInputElement>(null);

  const isPortfolio = "currency" in props.collection;
  const isWatchlist = "subscribed" in props.collection;
  const collectionLabel = isPortfolio ? "Portfolio" : "Watchlist";

  /**
   * Checks for errors in the input fields.
   * @returns Whether the input fields are valid.
   */
  const validate = (): boolean => {
    if (isPortfolio) {
      const isAmountValid = amountInputRef.current?.checkValidity() ?? false;
      return isAmountValid;
    }
    return true;
  };

  /**
   * Adds the stock to the collection.
   * @param ticker The ticker of the stock.
   */
  const addStockToCollection = (ticker: string) => {
    if (!validate()) return;
    (isPortfolio
      ? portfolioClient[":id"].stocks[":ticker"].$put({
          param: { id: String(props.collection.id), ticker },
          json: { amount: +amountInput },
        })
      : watchlistClient[":id"].stocks[":ticker"].$put({ param: { id: String(props.collection.id), ticker } })
    )
      .then(handleResponse)
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
          <Box sx={{ pb: 1 }}>
            <Typography variant="h3">
              Add Stock to {collectionLabel} “{props.collection.name}”
            </Typography>
            {"currency" in props.collection && ( // Required for type narrowing
              <Grid container spacing={1} sx={{ my: 1, maxWidth: 600, alignItems: "center" }}>
                <Grid size={12}>
                  <TextField
                    onChange={(event) => {
                      setAmountInput(event.target.value);
                      // If in error state, check whether error is resolved. If so, clear the error.
                      if (amountError && event.target.checkValidity()) setAmountError("");
                    }}
                    onInvalid={(event) => setAmountError((event.target as HTMLInputElement).validationMessage)}
                    error={!!amountError}
                    helperText={amountError}
                    inputRef={amountInputRef}
                    required
                    label="Amount"
                    value={amountInput}
                    autoFocus
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start" sx={{ width: 30, mt: "1px" }}>
                            {props.collection.currency}
                          </InputAdornment>
                        ),
                      },
                      htmlInput: {
                        inputMode: "decimal",
                        type: "number",
                        // Amount must be divisible by the currency's minor unit
                        step: Math.pow(10, -1 * currencyMinorUnits[props.collection.currency]),
                        // Amount must be positive
                        min: Math.pow(10, -1 * currencyMinorUnits[props.collection.currency]),
                      },
                    }}
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

/**
 * Properties for the AddStockToCollection component.
 */
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
