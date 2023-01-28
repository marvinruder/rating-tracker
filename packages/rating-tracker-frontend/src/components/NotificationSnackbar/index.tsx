import {
  Alert,
  AlertProps,
  AlertTitle,
  Snackbar,
  SnackbarProps,
} from "@mui/material";
import { useEffect, useState } from "react";
import useNotification from "../../helpers/useNotification";

/**
 * The duration of the transition between the snackbar being shown and hidden.
 */
const TRANSITION_DURATION = 350;

/**
 * A snackbar that displays a notification.
 *
 * @param {NotificationSnackbarProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const NotificationSnackbar = (
  props: NotificationSnackbarProps
): JSX.Element => {
  const [snackbarShown, setSnackbarShown] = useState<boolean>(false);
  // The notification is provided by the NotificationContext.
  const { notification, setNotification } = useNotification();
  useEffect(() => setSnackbarShown(notification !== undefined), [notification]);

  /**
   * A callback that is called when the snackbar is closed.
   */
  const closeNotification = () => {
    setSnackbarShown(false);
    setTimeout(() => {
      // Delete the notification after the transition is finished to avoid a flash of a notification of the wrong
      // severity.
      setNotification(undefined);
    }, TRANSITION_DURATION);
  };

  return (
    <Snackbar
      {...props.snackbarProps}
      open={snackbarShown}
      autoHideDuration={10000}
      onClose={closeNotification}
      transitionDuration={TRANSITION_DURATION}
    >
      <Alert
        {...props.alertProps}
        onClose={closeNotification}
        severity={notification?.severity ?? "info"}
        sx={{ maxWidth: "450px" }}
      >
        <AlertTitle>
          <strong>{notification?.title}</strong>
        </AlertTitle>
        {notification?.message}
      </Alert>
    </Snackbar>
  );
};

/**
 * Properties for the NotificationSnackbar component.
 */
interface NotificationSnackbarProps {
  /**
   * Properties to be passed to the Snackbar component.
   */
  snackbarProps?: Partial<SnackbarProps>;
  /**
   * Properties to be passed to the Alert component.
   */
  alertProps?: Partial<AlertProps>;
}

export default NotificationSnackbar;
