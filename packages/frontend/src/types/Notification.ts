import type { AlertColor } from "@mui/material";

/**
 * A notification to be displayed to the user.
 */
export type Notification = {
  /**
   * The severity of the notification.
   */
  severity: AlertColor;
  /**
   * The title of the notification.
   */
  title: string;
  /**
   * A more detailed message to be displayed.
   */
  message: string;
};
