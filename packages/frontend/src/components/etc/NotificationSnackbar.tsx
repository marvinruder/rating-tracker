import type { AlertProps, SnackbarCloseReason, SnackbarProps } from "@mui/material";
import { Alert, AlertTitle, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";

import { useNotificationContextState, useNotificationContextUpdater } from "../../contexts/NotificationContext";

/**
 * The duration of the transition between the snackbar being shown and hidden.
 */
const TRANSITION_DURATION = 350;

/**
 * A snackbar that displays a notification.
 * @param props The properties of the component.
 * @returns The component.
 */
export const NotificationSnackbar = (props: NotificationSnackbarProps): JSX.Element => {
  const [snackbarShown, setSnackbarShown] = useState<boolean>(false);
  // The notification is provided by the NotificationContext.
  const { notification } = useNotificationContextState();
  const { setNotification } = useNotificationContextUpdater();
  useEffect(() => setSnackbarShown(notification !== undefined), [notification]);

  /**
   * A callback that is called when the snackbar is closed.
   * @param _ The event that triggered the callback.
   * @param reason The reason why the snackbar was closed.
   */
  const closeNotification = (_: Event | React.SyntheticEvent<any, Event>, reason?: SnackbarCloseReason) => {
    // Clickaway is not used intentionally, but sometimes fired anyhow, which we want to ignore.
    if (reason !== "clickaway") {
      setSnackbarShown(false);
      setTimeout(() => {
        // Delete the notification after the transition is finished to avoid a flash of a notification of the wrong
        // severity.
        setNotification(undefined);
      }, TRANSITION_DURATION);
    }
  };

  return notification?.title || notification?.message ? (
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
  ) : (
    <></>
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
