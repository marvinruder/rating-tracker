import { AlertColor } from "@mui/material";

export type Notification = {
  severity: AlertColor;
  title: string;
  message: string;
};
