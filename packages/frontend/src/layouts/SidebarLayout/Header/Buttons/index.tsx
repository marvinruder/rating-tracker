import { Box } from "@mui/material";

import { HeaderSearch } from "./Search";

/**
 * Renders the buttons in the header.
 *
 * @returns {JSX.Element} The component.
 */
export const HeaderButtons = (): JSX.Element => {
  return (
    <Box sx={{ ml: 1, my: 1 }}>
      <HeaderSearch />
    </Box>
  );
};
