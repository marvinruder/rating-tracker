import CircleIcon from "@mui/icons-material/Circle";
import type { AlertColor } from "@mui/material";
import { Box } from "@mui/material";
import type { FC } from "react";

import type { Status } from "../../types/Status";

/**
 * Displays a traffic-light-like status indicator.
 * @param props The properties of the component.
 * @returns The component.
 */
export const StatusIndicator: FC<StatusIndicatorProps> = (props: StatusIndicatorProps): JSX.Element => (
  <Box
    sx={(theme) => ({
      height: `calc(${theme.typography.body1.fontSize}px * ${theme.typography.body1.lineHeight})`,
      display: "flex",
      alignItems: "center",
    })}
  >
    <CircleIcon
      sx={(theme) => ({
        width: theme.typography.body1.fontSize,
        height: theme.typography.body1.fontSize,
        color: props.status === "N/A" ? theme.palette.secondary.main : theme.palette[props.status as AlertColor].main,
        ...(props.status === "N/A"
          ? {}
          : {
              filter:
                `drop-shadow(0 0 calc(${theme.typography.body1.fontSize}px * 0.2) ` +
                `${theme.palette[props.status as AlertColor].main})`,
            }),
      })}
    />
  </Box>
);

/**
 * The properties of the component.
 */
export interface StatusIndicatorProps {
  /**
   * The status of the indicator.
   */
  status: Status;
}

export default StatusIndicator;
