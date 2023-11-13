import type { ChipProps } from "@mui/material";
import { Chip, useTheme } from "@mui/material";
import { Stock } from "@rating-tracker/commons";
import { FC } from "react";

/**
 * Displays a chip with a colored icon. The color depends on the value of the stock's
 * MSCI Implied Temperature Rise and resembles the company’s alignment with the Paris Agreement.
 *
 * @param {ChipProps & { stock: Stock }} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const TemperatureChip: FC<ChipProps & { stock: Stock }> = (props: ChipProps & { stock: Stock }): JSX.Element => {
  const theme = useTheme();
  return (
    <Chip
      {...props}
      sx={{
        ...props.sx,
        ".MuiChip-icon": {
          color:
            props.stock.msciTemperature <= 1.5
              ? theme.colors.msci.Aligned1
              : props.stock.msciTemperature <= 2.0
                ? theme.colors.msci.Aligned2
                : props.stock.msciTemperature <= 3.2
                  ? theme.colors.msci.Misaligned
                  : theme.colors.msci.StronglyMisaligned,
        },
      }}
    />
  );
};
