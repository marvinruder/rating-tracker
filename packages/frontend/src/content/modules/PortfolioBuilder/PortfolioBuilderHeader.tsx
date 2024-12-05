import { Typography } from "@mui/material";

/**
 * A header for the portfolio builder page.
 * @returns The component.
 */
export const PortfolioBuilderHeader = (): React.JSX.Element => (
  <>
    <Typography variant="h3" component="h3" gutterBottom>
      Portfolio Builder
    </Typography>
    <Typography variant="subtitle2">
      Weight your selection of stocks based on your preferred proportions of regions, sectors and other factors.
    </Typography>
  </>
);
