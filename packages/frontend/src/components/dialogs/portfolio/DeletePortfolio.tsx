import DeleteIcon from "@mui/icons-material/Delete";
import LoadingButton from "@mui/lab/LoadingButton";
import { DialogTitle, Typography, DialogContent, DialogActions, Button } from "@mui/material";
import { PortfolioSummary, portfoliosEndpointPath } from "@rating-tracker/commons";
import { useState } from "react";
import { useNavigate } from "react-router";

import { useNotification } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

/**
 * A dialog to delete a portfolio from the backend.
 *
 * @param {DeletePortfolioProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const DeletePortfolio = (props: DeletePortfolioProps): JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState(false);

  const { setErrorNotificationOrClearSession: setErrorNotification } = useNotification();
  const navigate = useNavigate();

  /**
   * Deletes the portfolio from the backend.
   */
  const deletePortfolio = () => {
    props.portfolio &&
      (setRequestInProgress(true),
      api
        .delete(portfoliosEndpointPath + `/${props.portfolio.id}`)
        // If the dialog is shown from the portfolio list, the list should be updated.
        .then(() => props.getPortfolios && props.getPortfolios())
        .catch((e) => setErrorNotification(e, "deleting portfolio"))
        .finally(() => {
          setRequestInProgress(false);
          // If the dialog is shown from e.g. a detail page, the user should be redirected to another page.
          props.navigateTo && navigate(props.navigateTo);
          props.onClose();
        }));
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
        <Button onClick={props.onClose}>Cancel</Button>
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
   * A method to update the portfolio summaries after the portfolio was deleted.
   */
  getPortfolios?: () => void;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
  /**
   * The path to navigate to after the portfolio was deleted.
   */
  navigateTo?: string;
}
