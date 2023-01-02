import { useContext } from "react";

import {
  Box,
  alpha,
  Stack,
  lighten,
  Divider,
  IconButton,
  Tooltip,
  styled,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { SidebarContext } from "../../../contexts/SidebarContext";

import HeaderButtons from "./Buttons";
import HeaderUserbox from "./Userbox";
import HeaderMenu from "./Menu";

const HeaderWrapper = styled(Box)(
  ({ theme }) => `
        height: ${theme.header.height};
        color: ${theme.header.textColor};
        right: 0;
        z-index: 6;
        background-color: ${alpha(theme.header.background, 0.95)};
        backdrop-filter: blur(3px);
        position: fixed;
        justify-content: space-between;
        width: 100%;
        @media (min-width: ${theme.breakpoints.values.lg}px) {
            left: ${theme.sidebar.width};
            width: auto;
        }
`
);

function Header() {
  const { toggleSidebar } = useContext(SidebarContext);
  const theme = useTheme();

  return (
    <HeaderWrapper
      display="flex"
      alignItems="center"
      sx={{
        px: 1,
        boxShadow:
          theme.palette.mode === "dark"
            ? `0 1px 0 ${alpha(
                lighten(theme.colors.primary.main, 0.7),
                0.15
              )}, 0px 2px 8px -3px rgba(0, 0, 0, 0.2), 0px 5px 22px -4px rgba(0, 0, 0, .1)`
            : `0px 2px 8px -3px ${alpha(
                theme.colors.alpha.black[100],
                0.2
              )}, 0px 5px 22px -4px ${alpha(
                theme.colors.alpha.black[100],
                0.1
              )}`,
      }}
    >
      <Box
        component="span"
        sx={{
          mr: 1,
          display: "inline-block",
          visibility: { lg: "hidden", xs: "visible" },
        }}
      >
        <Tooltip arrow title="Toggle Menu">
          <IconButton color="primary" onClick={toggleSidebar}>
            <MenuIcon />
          </IconButton>
        </Tooltip>
      </Box>
      {/* <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        alignItems="center"
        spacing={2}
      >
        <HeaderMenu />
      </Stack> */}
      <Box display="flex" alignItems="center">
        <HeaderButtons />
        <HeaderUserbox />
      </Box>
    </HeaderWrapper>
  );
}

export default Header;
