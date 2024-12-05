import DeleteIcon from "@mui/icons-material/Delete";
import LoadingButton from "@mui/lab/LoadingButton";
import { DialogTitle, Typography, DialogContent, DialogActions, Button } from "@mui/material";
import type { Stock } from "@rating-tracker/commons";
import { handleResponse } from "@rating-tracker/commons";
import { useState } from "react";

import stockClient from "../../../api/stock";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";

/**
 * A dialog to delete a stock from the backend.
 * @param props The properties of the component.
 * @returns The component.
 */
export const DeleteStock = (props: DeleteStockProps): React.JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState(false);

  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  /**
   * Deletes the stock from the backend.
   */
  const deleteStock = () => {
    setRequestInProgress(true);
    stockClient[":ticker"]
      .$delete({ param: { ticker: props.stock.ticker } })
      .then(handleResponse)
      .then(() => (props.onDelete(), props.onClose()))
      .catch((e) => setErrorNotificationOrClearSession(e, "deleting stock"))
      .finally(() => setRequestInProgress(false));
  };

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Delete Stock “{props.stock.name}”</Typography>
      </DialogTitle>
      <DialogContent>
        Do you really want to delete the Stock “{props.stock.name}” ({props.stock.ticker})? This action cannot be
        reversed.
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={props.onClose} sx={{ mr: "auto" }}>
          Cancel
        </Button>
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={deleteStock}
          color="error"
          startIcon={<DeleteIcon />}
        >
          Delete “{props.stock.ticker}”
        </LoadingButton>
      </DialogActions>
    </>
  );
};

/**
 * Properties for the DeleteStock component.
 */
interface DeleteStockProps {
  /**
   * The stock to delete.
   */
  stock: Stock;
  /**
   * A method that is called after the stock was deleted successfully.
   */
  onDelete: () => void;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
}
