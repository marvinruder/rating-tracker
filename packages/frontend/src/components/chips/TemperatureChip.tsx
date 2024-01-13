import type { ChipProps } from "@mui/material";
import { Chip, useTheme } from "@mui/material";
import { FC } from "react";

/**
 * Displays a chip with a colored icon. The color depends on the value of the stock's
 * MSCI Implied Temperature Rise and resembles the company’s alignment with the Paris Agreement.
 *
 * @param {ChipProps & { msciTemperature: number }} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const TemperatureChip: FC<ChipProps & { msciTemperature: number }> = (
  props: ChipProps & { msciTemperature: number },
): JSX.Element => {
  const theme = useTheme();
  const chipProps = { ...props };
  delete chipProps.msciTemperature;

  return (
    <Chip
      {...chipProps}
      sx={{
        ...props.sx,
        ".MuiChip-icon": {
          color:
            props.msciTemperature <= 1.5
              ? theme.colors.msci.Aligned1
              : props.msciTemperature <= 2.0
                ? theme.colors.msci.Aligned2
                : props.msciTemperature <= 3.2
                  ? theme.colors.msci.Misaligned
                  : theme.colors.msci.StronglyMisaligned,
        },
      }}
    />
  );
};
