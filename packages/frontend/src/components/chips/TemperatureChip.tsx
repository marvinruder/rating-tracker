import type { ChipProps } from "@mui/material";
import { Chip } from "@mui/material";
import type { FC } from "react";

import { getMSCITemperatureColorIndex } from "../../utils/colorResolvers";

/**
 * Displays a chip with a colored icon. The color depends on the value of the stock's
 * MSCI Implied Temperature Rise and resembles the company’s alignment with the Paris Agreement.
 * @param props The properties of the component.
 * @returns The component.
 */
export const TemperatureChip: FC<ChipProps & { msciTemperature: number }> = (
  props: ChipProps & { msciTemperature: number },
): React.JSX.Element => {
  const { msciTemperature, ...chipProps } = props;

  return (
    <Chip
      {...chipProps}
      sx={(theme) => ({
        ...(props.sx as object),
        ".MuiChip-icon": {
          color: theme.palette.msci[getMSCITemperatureColorIndex({ msciTemperature })],
        },
      })}
    />
  );
};
