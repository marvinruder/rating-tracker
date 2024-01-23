import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import ListIcon from "@mui/icons-material/List";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { LoadingButton } from "@mui/lab";
import type { BoxProps } from "@mui/material";
import {
  alpha,
  Box,
  List,
  Button,
  ListItem,
  Divider,
  useTheme,
  Card,
  Typography,
  Tooltip,
  Grid,
  Skeleton,
} from "@mui/material";
import {
  ADMINISTRATIVE_ACCESS,
  portfoliosEndpointPath,
  stocksEndpointPath,
  usersEndpointPath,
  watchlistsEndpointPath,
} from "@rating-tracker/commons";
import type { FC } from "react";
import React, { Fragment, useContext, useState } from "react";
import { NavLink } from "react-router-dom";

import { StatusIndicator } from "../../../components/etc/StatusIndicator";
import SidebarContext from "../../../contexts/SidebarContext";
import { UserContext } from "../../../contexts/UserContext";

import { Logo } from "./Logo";

/**
 * A wrapper for the sidebar menu component.
 *
 * @param {React.ReactNode} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const MenuWrapper: FC<BoxProps & { children: React.ReactNode }> = (
  props: BoxProps & { children: React.ReactNode },
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
  props: BoxProps & { children: React.ReactNode },
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
export const SidebarContent = (): JSX.Element => {
  const { closeSidebar, systemStatus, systemStatusLoading, refreshSystemStatus } = useContext(SidebarContext);
  const [statusTooltipOpen, setStatusTooltipOpen] = useState(false);

  const theme = useTheme();

  const { user } = useContext(UserContext);

  return (
    <>
      <Box mt={1} mx={2}>
        <Logo />
      </Box>
      <Divider sx={{ mt: 3, mx: 2, background: theme.colors.alpha.trueWhite[10] }} />
      <MenuWrapper>
        <List component="div">
          <SubMenuWrapper>
            <List component="div">
              <ListItem component="div">
                <Button
                  sx={{ ".MuiTouchRipple-child": { backgroundColor: theme.colors.alpha.trueWhite[30] } }}
                  component={NavLink}
                  onClick={closeSidebar}
                  to={stocksEndpointPath}
                  startIcon={<ListIcon />}
                >
                  All Stocks
                </Button>
              </ListItem>
              <ListItem component="div">
                <Button
                  sx={{ ".MuiTouchRipple-child": { backgroundColor: theme.colors.alpha.trueWhite[30] } }}
                  component={NavLink}
                  onClick={closeSidebar}
                  to={watchlistsEndpointPath}
                  startIcon={<CollectionsBookmarkIcon />}
                >
                  Watchlists
                </Button>
              </ListItem>
              <ListItem component="div">
                <Button
                  sx={{ ".MuiTouchRipple-child": { backgroundColor: theme.colors.alpha.trueWhite[30] } }}
                  component={NavLink}
                  onClick={closeSidebar}
                  to={portfoliosEndpointPath}
                  startIcon={<ShoppingCartIcon />}
                >
                  Portfolios
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
                      sx={{ ".MuiTouchRipple-child": { backgroundColor: theme.colors.alpha.trueWhite[30] } }}
                      component={NavLink}
                      onClick={closeSidebar}
                      to={usersEndpointPath}
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
      <Box bottom={0} position="absolute" width="100%">
        <Divider sx={{ background: theme.colors.alpha.trueWhite[10] }} />
        <Tooltip
          components={{ Tooltip: Card }}
          componentsProps={{
            tooltip: {
              sx: {
                width: `calc(${theme.sidebar.width} - ${theme.spacing(2)})`,
                transformOrigin: "bottom",
                mb: "14px",
              },
            },
          }}
          placement="top"
          enterTouchDelay={0}
          leaveTouchDelay={5000}
          open={statusTooltipOpen}
          onOpen={() => setStatusTooltipOpen(true)}
          onClose={(e) =>
            !(
              (!(e instanceof Event) &&
                e.type === "mouseleave" &&
                "relatedTarget" in e &&
                e.relatedTarget instanceof Element &&
                e.relatedTarget.id === "refresh-system-status-button") ||
              (e.type === "blur" && e.target instanceof Element && e.target.id === "refresh-system-status-button")
            ) && setStatusTooltipOpen(false)
          }
          title={
            <Grid container p={1} alignItems="flex-start" rowSpacing={0.5}>
              {Object.entries(systemStatus.services).map(([service, status]) => (
                <Fragment key={service}>
                  <Grid item xs={4.8} display="flex" columnGap={1}>
                    <StatusIndicator status={systemStatusLoading ? "N/A" : status.status} />
                    <Typography variant="body1" fontWeight="bold">
                      {service}
                    </Typography>
                  </Grid>
                  <Grid item xs={7.2}>
                    <Typography variant="body2">
                      {systemStatusLoading ? <Skeleton width="100%" /> : status.details}
                    </Typography>
                  </Grid>
                </Fragment>
              ))}
              <Grid item xs={12} mt={1}>
                <LoadingButton
                  id="refresh-system-status-button"
                  onClick={refreshSystemStatus}
                  loading={systemStatusLoading}
                  variant="outlined"
                  color="primary"
                  size="small"
                  fullWidth
                  startIcon={<RefreshIcon />}
                >
                  Refresh
                </LoadingButton>
              </Grid>
            </Grid>
          }
        >
          <Card
            sx={{
              m: 1,
              p: 1,
              width: `calc(100% - ${theme.spacing(2)})`,
              boxShadow: "none",
              background: "transparent",
              border: `1px solid ${theme.colors.alpha.trueWhite[10]}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing(1),
            }}
          >
            <StatusIndicator status={systemStatusLoading ? "N/A" : systemStatus.status.status} />
            <Typography variant="body1" fontWeight="bold" textAlign="center" color={theme.colors.alpha.trueWhite[70]}>
              {systemStatusLoading ? "Loading…" : systemStatus.status.details}
            </Typography>
          </Card>
        </Tooltip>
      </Box>
    </>
  );
};
