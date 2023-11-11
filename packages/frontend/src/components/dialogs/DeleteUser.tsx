import DeleteIcon from "@mui/icons-material/Delete";
import LoadingButton from "@mui/lab/LoadingButton";
import { DialogTitle, Typography, DialogContent, DialogActions, Button } from "@mui/material";
import { User, usersEndpointPath } from "@rating-tracker/commons";
import { useState } from "react";

import { useNotification } from "../../contexts/NotificationContext";
import api from "../../utils/api";

/**
 * A dialog to delete a user from the backend.
 *
 * @param {DeleteUserProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const DeleteUser = (props: DeleteUserProps): JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState(false);

  const { setErrorNotificationOrClearSession: setErrorNotification } = useNotification();

  /**
   * Deletes the user from the backend.
   */
  const deleteUser = () => {
    props.user &&
      (setRequestInProgress(true),
      api
        .delete(usersEndpointPath + `/${props.user.email}`)
        // Update the user list after the user was deleted.
        .then(() => props.getUsers && props.getUsers())
        .catch((e) => setErrorNotification(e, "deleting user"))
        .finally(() => {
          setRequestInProgress(false);
          props.onClose();
        }));
  };

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Delete User “{props.user.name}”</Typography>
      </DialogTitle>
      <DialogContent>
        Do you really want to delete the User “{props.user.name}” ({props.user.email})? This action cannot be reversed.
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={props.onClose}>Cancel</Button>
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={deleteUser}
          color="error"
          startIcon={<DeleteIcon />}
        >
          Delete user
        </LoadingButton>
      </DialogActions>
    </>
  );
};

/**
 * Properties for the DeleteUser component.
 */
interface DeleteUserProps {
  /**
   * The user to delete.
   */
  user: User;
  /**
   * A method to update the user list after the user was deleted.
   */
  getUsers?: () => void;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
}
