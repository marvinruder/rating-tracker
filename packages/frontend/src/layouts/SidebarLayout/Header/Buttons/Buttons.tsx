import { Box } from "@mui/material";

import { HeaderSearchButton } from "./SearchButton";

/**
 * Renders the buttons in the header.
 * @returns The component.
 */
export const HeaderButtons = (): React.JSX.Element => {
  return (
    <Box sx={{ ml: 1, my: 1 }}>
      <HeaderSearchButton />
    </Box>
  );
};
