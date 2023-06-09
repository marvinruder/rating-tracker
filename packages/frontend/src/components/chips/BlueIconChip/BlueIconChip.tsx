import { ChipProps, Chip, useTheme } from "@mui/material";
import { FC } from "react";

/**
 * Displays a chip with a blue icon.
 *
 * @param {ChipProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const BlueIconChip: FC<ChipProps> = (props: ChipProps): JSX.Element => {
  const theme = useTheme();
  return <Chip {...props} sx={{ ...props.sx, ".MuiChip-icon": { color: theme.colors.primary.main } }} />;
};
