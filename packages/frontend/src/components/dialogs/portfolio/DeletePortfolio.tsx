import DeleteIcon from "@mui/icons-material/Delete";
import LoadingButton from "@mui/lab/LoadingButton";
import { DialogTitle, Typography, DialogContent, DialogActions, Button } from "@mui/material";
import type { PortfolioSummary } from "@rating-tracker/commons";
import { handleResponse } from "@rating-tracker/commons";
import { useState } from "react";

import portfolioClient from "../../../api/portfolio";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";

/**
 * A dialog to delete a portfolio from the backend.
 * @param props The properties of the component.
 * @returns The component.
 */
export const DeletePortfolio = (props: DeletePortfolioProps): React.JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState(false);

  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  /**
   * Deletes the portfolio from the backend.
   */
  const deletePortfolio = () => {
    setRequestInProgress(true);
    portfolioClient[":id"]
      .$delete({ param: { id: String(props.portfolio.id) } })
      .then(handleResponse)
      .then(() => (props.onDelete(), props.onClose()))
      .catch((e) => setErrorNotificationOrClearSession(e, "deleting portfolio"))
      .finally(() => setRequestInProgress(false));
  };

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Delete Portfolio “{props.portfolio.name}”</Typography>
      </DialogTitle>
      <DialogContent>
        Do you really want to delete the Portfolio “{props.portfolio.name}”? This action cannot be reversed.
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={props.onClose} sx={{ mr: "auto" }}>
          Cancel
        </Button>
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={deletePortfolio}
          color="error"
          startIcon={<DeleteIcon />}
        >
          Delete Portfolio
        </LoadingButton>
      </DialogActions>
    </>
  );
};

/**
 * Properties for the DeletePortfolio component.
 */
interface DeletePortfolioProps {
  /**
   * The portfolio to delete.
   */
  portfolio: PortfolioSummary;
  /**
   * A method that is called after the portfolio was deleted successfully.
   */
  onDelete: () => void;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
}
