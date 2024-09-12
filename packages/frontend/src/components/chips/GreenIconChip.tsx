import type { ChipProps } from "@mui/material";
import { Chip, useTheme } from "@mui/material";
import type { FC } from "react";

/**
 * Displays a chip with a green icon.
 * @param props The properties of the component.
 * @returns The component.
 */
export const GreenIconChip: FC<ChipProps> = (props: ChipProps): JSX.Element => {
  const theme = useTheme();
  return <Chip {...props} sx={{ ...props.sx, ".MuiChip-icon": { color: theme.palette.sector.Defensive } }} />;
};
