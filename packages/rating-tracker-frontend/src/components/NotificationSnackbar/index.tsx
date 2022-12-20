import {
  Alert,
  AlertProps,
  AlertTitle,
  Snackbar,
  SnackbarProps,
} from "@mui/material";
import { useEffect, useState } from "react";
import useNotification from "../../helpers/useNotification";

const TRANSITION_DURATION = 350;

const NotificationSnackbar = (props: NotificationSnackbarProps) => {
  const [snackbarShown, setSnackbarShown] = useState<boolean>(false);
  const { notification, setNotification } = useNotification();
  useEffect(() => setSnackbarShown(notification !== undefined), [notification]);

  const closeNotification = () => {
    setSnackbarShown(false);
    setTimeout(() => {
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

interface NotificationSnackbarProps {
  snackbarProps?: Partial<SnackbarProps>;
  alertProps?: Partial<AlertProps>;
}

export default NotificationSnackbar;
