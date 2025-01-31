import DeleteIcon from "@mui/icons-material/Delete";
import { DialogTitle, Typography, DialogContent, DialogActions, Button } from "@mui/material";
import type { User } from "@rating-tracker/commons";
import { handleResponse } from "@rating-tracker/commons";
import { useState } from "react";

import userClient from "../../../api/user";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";

/**
 * A dialog to delete a user from the backend.
 * @param props The properties of the component.
 * @returns The component.
 */
export const DeleteUser = (props: DeleteUserProps): React.JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState(false);

  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  /**
   * Deletes the user from the backend.
   * @returns A {@link Promise} that resolves when the user was deleted and the dialog was closed.
   */
  const deleteUser = (): Promise<void> =>
    props.user &&
    (setRequestInProgress(true),
    userClient[":email"]
      .$delete({ param: { email: props.user.email } })
      .then(handleResponse)
      // Update the user list after the user was deleted.
      .then(() => (props.onDelete && props.onDelete(), props.onClose()))
      .catch((e) => setErrorNotificationOrClearSession(e, "deleting user"))
      .finally(() => setRequestInProgress(false)));

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Delete User “{props.user.name}”</Typography>
      </DialogTitle>
      <DialogContent>
        Do you really want to delete the User “{props.user.name}” ({props.user.email})? This action cannot be reversed.
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={props.onClose} sx={{ mr: "auto" }}>
          Cancel
        </Button>
        <Button
          loading={requestInProgress}
          variant="contained"
          onClick={deleteUser}
          color="error"
          startIcon={<DeleteIcon />}
        >
          Delete user
        </Button>
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
   * A method that is called after the user was deleted successfully.
   */
  onDelete?: () => void;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
}
