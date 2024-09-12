import type { ChipProps } from "@mui/material";
import { Chip, useTheme } from "@mui/material";
import type { FC } from "react";

/**
 * Displays a chip with a yellow icon.
 * @param props The properties of the component.
 * @returns The component.
 */
export const YellowIconChip: FC<ChipProps> = (props: ChipProps): JSX.Element => {
  const theme = useTheme();
  return <Chip {...props} sx={{ ...props.sx, ".MuiChip-icon": { color: theme.palette.msci.Average } }} />;
};
