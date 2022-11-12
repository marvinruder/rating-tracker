import {
  Alert,
  AlertColor,
  AlertProps,
  AlertTitle,
  Slide,
  Snackbar,
  SnackbarProps,
} from "@mui/material";
import { useEffect, useState } from "react";

const NotificationSnackbar = (props: NotificationSnackbarProps) => {
  const [snackbarShown, setSnackbarShown] = useState<boolean>(false);
  useEffect(
    () => setSnackbarShown(props.notification != undefined),
    [props.notification]
  );

  return (
    <Snackbar
      {...props.snackbarProps}
      open={snackbarShown}
      autoHideDuration={10000}
      onClose={() => setSnackbarShown(false)}
      TransitionComponent={(props) => <Slide {...props} direction="up" />}
    >
      <Alert
        {...props.alertProps}
        onClose={() => setSnackbarShown(false)}
        severity={props.notification?.severity ?? "info"}
        sx={{ maxWidth: "450px" }}
      >
        <AlertTitle>
          <strong>{props.notification?.title}</strong>
        </AlertTitle>
        {props.notification?.message}
      </Alert>
    </Snackbar>
  );
};

export interface Notification {
  severity: AlertColor;
  title: string;
  message: string;
}

interface NotificationSnackbarProps {
  notification: Notification;
  snackbarProps?: Partial<SnackbarProps>;
  alertProps?: Partial<AlertProps>;
}

export default NotificationSnackbar;
