import CircleIcon from "@mui/icons-material/Circle";
import { Box, useTheme } from "@mui/material";
import type { FC } from "react";

import type { Status } from "../../types/Status";

/**
 * Displays a traffic-light-like status indicator.
 * @param props The properties of the component.
 * @returns The component.
 */
export const StatusIndicator: FC<StatusIndicatorProps> = (props: StatusIndicatorProps): JSX.Element => {
  const theme = useTheme();
  const color = props.status === "N/A" ? theme.colors.secondary.main : theme.colors[props.status].main;

  return (
    <Box
      sx={{
        height: `calc(${theme.typography.body1.fontSize}px * ${theme.typography.body1.lineHeight})`,
        display: "flex",
        alignItems: "center",
      }}
    >
      <CircleIcon
        sx={{
          width: theme.typography.body1.fontSize,
          height: theme.typography.body1.fontSize,
          color,
          filter:
            props.status === "N/A"
              ? undefined
              : `drop-shadow(0 0 calc(${theme.typography.body1.fontSize}px * 0.2) ${color})`,
        }}
      />
    </Box>
  );
};

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
