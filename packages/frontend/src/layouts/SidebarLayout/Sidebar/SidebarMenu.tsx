import { FC, useContext } from "react";

import { alpha, Box, List, Button, ListItem, Divider, useTheme, BoxProps } from "@mui/material";
import { NavLink } from "react-router-dom";
import SidebarContext from "../../../contexts/SidebarContext";

import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ListIcon from "@mui/icons-material/List";
import { UserContext } from "../../../router";
import { ADMINISTRATIVE_ACCESS } from "@rating-tracker/commons";

/**
 * A wrapper for the sidebar menu component.
 *
 * @param {React.ReactNode} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const MenuWrapper: FC<BoxProps & { children: React.ReactNode }> = (
  props: BoxProps & { children: React.ReactNode }
): JSX.Element => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        ".MuiList-root": { p: 1, "& > .MuiList-root": { p: theme.spacing(0, 0, 1) } },
        ".MuiListSubheader-root": {
          textTransform: "uppercase",
          fontWeight: "bold",
          fontSize: 12,
          color: theme.colors.alpha.trueWhite[50],
          padding: theme.spacing(0, 2.5),
          lineHeight: 1.4,
        },
      }}
    >
      {props.children}
    </Box>
  );
};

/**
 * A wrapper for the sidebar submenu component.
 *
 * @param {React.ReactNode} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const SubMenuWrapper: FC<BoxProps & { children: React.ReactNode }> = (
  props: BoxProps & { children: React.ReactNode }
): JSX.Element => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        ".MuiList-root": {
          ".MuiListItem-root": {
            p: "4px 0",
            ".MuiBadge-root": {
              position: "absolute",
              right: theme.spacing(3.2),
              ".MuiBadge-standard": {
                background: theme.colors.primary.main,
                fontSize: 10,
                fontWeight: "bold",
                textTransform: "uppercase",
                color: theme.palette.primary.contrastText,
              },
            },
            ".MuiButton-root": {
              display: "flex",
              color: theme.colors.alpha.trueWhite[70],
              backgroundColor: "transparent",
              width: "100%",
              justifyContent: "flex-start",
              p: theme.spacing(1.2, 3),
              ".MuiButton-startIcon, .MuiButton-endIcon": {
                transition: theme.transitions.create(["color"]),
                ".MuiSvgIcon-root": { fontSize: "inherit", transition: "none" },
              },
              ".MuiButton-startIcon": { color: theme.colors.alpha.trueWhite[30], fontSize: 20, mr: 1 },
              ".MuiButton-endIcon": { color: theme.colors.alpha.trueWhite[50], ml: "auto", opacity: 0.8, fontSize: 20 },
              "&.active, &:hover": {
                backgroundColor: alpha(theme.colors.alpha.trueWhite[100], 0.06),
                color: theme.colors.alpha.trueWhite[100],
                ".MuiButton-startIcon, .MuiButton-endIcon": { color: theme.colors.alpha.trueWhite[100] },
              },
            },
            "&.Mui-children": {
              flexDirection: "column",
              ".MuiBadge-root": { position: "absolute", right: theme.spacing(7) },
            },
            ".MuiCollapse-root": {
              width: "100%",
              ".MuiList-root": { p: theme.spacing(1, 0) },
              ".MuiListItem-root": {
                p: "4px 0",
                ".MuiButton-root": {
                  p: theme.spacing(0.8, 3),
                  ".MuiBadge-root": { right: theme.spacing(3.2) },
                  "&:before": {
                    content: '" "',
                    background: theme.colors.alpha.trueWhite[100],
                    opacity: 0,
                    transition: theme.transitions.create(["transform", "opacity"]),
                    width: 6,
                    height: 6,
                    transform: "scale(0)",
                    transformOrigin: "center",
                    borderRadius: 20,
                    mr: 1.8,
                  },
                  "&.active, &:hover": { "&:before": { transform: "scale(1)", opacity: 1 } },
                },
              },
            },
          },
        },
      }}
    >
      {props.children}
    </Box>
  );
};

/**
 * The menu inside the sidebar.
 *
 * @returns {JSX.Element} The component.
 */
export const SidebarMenu = (): JSX.Element => {
  const { closeSidebar } = useContext(SidebarContext);

  const theme = useTheme();

  const { user } = useContext(UserContext);

  return (
    <>
      <MenuWrapper>
        <List component="div">
          <SubMenuWrapper>
            <List component="div">
              <ListItem component="div">
                <Button disableRipple component={NavLink} onClick={closeSidebar} to="/stock" startIcon={<ListIcon />}>
                  All Stocks
                </Button>
              </ListItem>
              <ListItem component="div">
                <Button
                  disableRipple
                  component={NavLink}
                  onClick={closeSidebar}
                  to="/watchlist"
                  startIcon={<CollectionsBookmarkIcon />}
                >
                  Watchlists
                </Button>
              </ListItem>
            </List>
          </SubMenuWrapper>
          {user.hasAccessRight(ADMINISTRATIVE_ACCESS) && (
            <>
              <Divider sx={{ mx: 2, background: theme.colors.alpha.trueWhite[10] }} />
              <SubMenuWrapper>
                <List component="div">
                  <ListItem component="div">
                    <Button
                      disableRipple
                      component={NavLink}
                      onClick={closeSidebar}
                      to="/usermanagement"
                      startIcon={<ManageAccountsIcon />}
                    >
                      User Management
                    </Button>
                  </ListItem>
                </List>
              </SubMenuWrapper>
            </>
          )}
        </List>
      </MenuWrapper>
    </>
  );
};
