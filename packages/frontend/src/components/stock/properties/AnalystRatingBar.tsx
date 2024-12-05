import { Box, Tooltip, useTheme } from "@mui/material";
import type { Stock } from "@rating-tracker/commons";
import { RecordMath, analystRatingArray } from "@rating-tracker/commons";

/**
 * A colored bar with a tooltip that is used to visualize the Analyst Ratings.
 * @param props The properties of the component.
 * @param props.stock The stock to display the analyst rating for.
 * @returns The component.
 */
export const AnalystRatingBar = ({ stock, ...props }: AnalystRatingBarProps): React.JSX.Element => {
  const theme = useTheme();
  const sum = RecordMath.sum(stock.analystRatings);

  let processedCount = 0;
  const gradient = `linear-gradient(to right, ${analystRatingArray
    .map((rating) => {
      const colorStart = `${theme.palette.consensus[rating]} ${(processedCount / sum) * 100}%`;
      const count = stock.analystRatings[rating];
      const colorEnd = `${theme.palette.consensus[rating]} ${((processedCount + count) / sum) * 100}%`;
      processedCount += count;
      return `${colorStart}, ${colorEnd}`;
    })
    .join(", ")})`;

  return (
    <Box
      sx={{
        opacity:
          "analystCount" in stock && typeof stock.analystCount === "number"
            ? stock.analystCount < 10
              ? stock.analystCount / 10
              : 1
            : 1,
      }}
    >
      <Tooltip
        title={stock.analystConsensus}
        PopperProps={{
          sx: {
            ...(props.width ? { width: props.width } : {}),
            position: "static !important",
            transform: "none !important",
            ".MuiTooltip-tooltip": {
              mt: "-4px !important",
              width: "fit-content",
              mx: "auto",
              transition: "none !important",
            },
          },
          disablePortal: true,
          modifiers: [
            { name: "flip", enabled: false },
            { name: "preventOverflow", enabled: false },
          ],
        }}
        enterDelay={0}
        placement="bottom"
        open={props.open}
        arrow
      >
        <Box sx={{ width: props.width, height: 24, background: gradient, borderRadius: 0.5 }} />
      </Tooltip>
    </Box>
  );
};

/**
 * Properties for the AnalystRatingBar component.
 */
interface AnalystRatingBarProps {
  /**
   * The stock to display the analyst rating for.
   */
  stock: {
    analystConsensus: NonNullable<Stock["analystConsensus"]>;
    analystRatings: NonNullable<Stock["analystRatings"]>;
  };
  /**
   * The width of the bar.
   */
  width?: number;
  /**
   * Whether the tooltip is open.
   */
  open: boolean;
}
