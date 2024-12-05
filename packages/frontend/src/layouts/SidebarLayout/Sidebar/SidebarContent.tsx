import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import ListIcon from "@mui/icons-material/List";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LoadingButton from "@mui/lab/LoadingButton";
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
  Grid2 as Grid,
  Skeleton,
} from "@mui/material";
import {
  ADMINISTRATIVE_ACCESS,
  portfolioBuilderEndpointSuffix,
  portfoliosAPIPath,
  stocksAPIPath,
  usersAPIPath,
  watchlistsAPIPath,
} from "@rating-tracker/commons";
import type { FC } from "react";
import React, { Fragment, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { StatusIndicator } from "../../../components/etc/StatusIndicator";
import { useStatusContextState, useStatusContextUpdater } from "../../../contexts/StatusContext";
import { useUserContextState } from "../../../contexts/UserContext";

import { Logo } from "./Logo";

/**
 * A wrapper for the sidebar menu component.
 * @param props The properties of the component.
 * @returns The component.
 */
const MenuWrapper: FC<React.PropsWithChildren<BoxProps>> = (
  props: React.PropsWithChildren<BoxProps>,
): React.JSX.Element => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        ".MuiList-root": { p: 1, "& > .MuiList-root": { p: theme.spacing(0, 0, 1) } },
        ".MuiListSubheader-root": {
          textTransform: "uppercase",
          fontWeight: "bold",
          fontSize: 12,
          color: theme.palette.trueWhite.alpha50,
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
 * @param props The properties of the component.
 * @returns The component.
 */
const SubMenuWrapper: FC<React.PropsWithChildren<BoxProps>> = (
  props: React.PropsWithChildren<BoxProps>,
): React.JSX.Element => {
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
                background: theme.palette.primary.main,
                fontSize: 10,
                fontWeight: "bold",
                textTransform: "uppercase",
                color: theme.palette.primary.contrastText,
              },
            },
            ".MuiButton-root": {
              display: "flex",
              color: theme.palette.trueWhite.alpha70,
              backgroundColor: "transparent",
              width: "100%",
              justifyContent: "flex-start",
              p: theme.spacing(1.2, 3),
              ".MuiButton-startIcon, .MuiButton-endIcon": {
                transition: theme.transitions.create(["color"]),
                ".MuiSvgIcon-root": { fontSize: "inherit", transition: "none" },
              },
              ".MuiButton-startIcon": { color: theme.palette.trueWhite.alpha30, fontSize: 20, mr: 1 },
              ".MuiButton-endIcon": { color: theme.palette.trueWhite.alpha50, ml: "auto", opacity: 0.8, fontSize: 20 },
              "&.active:not(.notActive), &:hover": {
                backgroundColor: alpha(theme.palette.trueWhite.main, 0.06),
                color: theme.palette.trueWhite.main,
                ".MuiButton-startIcon, .MuiButton-endIcon": { color: theme.palette.trueWhite.main },
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
                    background: theme.palette.trueWhite.main,
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
 * @param props The component props.
 * @returns The component.
 */
export const SidebarContent = (props: SidebarContentProps): React.JSX.Element => {
  const [statusTooltipOpen, setStatusTooltipOpen] = useState(false);

  const theme = useTheme();
  const location = useLocation();

  const { systemStatus, systemStatusLoading } = useStatusContextState();
  const { refreshSystemStatus } = useStatusContextUpdater();

  const { user } = useUserContextState();

  return (
    <>
      <Box sx={{ mt: 1, mx: 2 }}>
        <Logo />
      </Box>
      <Divider sx={{ mt: 3, mx: 2, background: theme.palette.trueWhite.alpha10 }} />
      <MenuWrapper>
        <List component="div">
          <SubMenuWrapper>
            <List component="div">
              <ListItem component="div">
                <Button
                  sx={{ ".MuiTouchRipple-child": { backgroundColor: theme.palette.trueWhite.alpha30 } }}
                  component={NavLink}
                  onClick={props.closeSidebar}
                  to={stocksAPIPath}
                  startIcon={<ListIcon />}
                >
                  All Stocks
                </Button>
              </ListItem>
              <ListItem component="div">
                <Button
                  sx={{ ".MuiTouchRipple-child": { backgroundColor: theme.palette.trueWhite.alpha30 } }}
                  component={NavLink}
                  onClick={props.closeSidebar}
                  to={watchlistsAPIPath}
                  startIcon={<CollectionsBookmarkIcon />}
                >
                  Watchlists
                </Button>
              </ListItem>
              <ListItem component="div">
                <Button
                  sx={{ ".MuiTouchRipple-child": { backgroundColor: theme.palette.trueWhite.alpha30 } }}
                  component={NavLink}
                  {...(location.pathname === portfoliosAPIPath + portfolioBuilderEndpointSuffix
                    ? { className: "notActive" }
                    : {})}
                  onClick={props.closeSidebar}
                  to={portfoliosAPIPath}
                  startIcon={<ShoppingCartIcon />}
                >
                  Portfolios
                </Button>
              </ListItem>
            </List>
          </SubMenuWrapper>
          <Divider sx={{ mx: 2, background: theme.palette.trueWhite.alpha10 }} />
          <SubMenuWrapper>
            <List component="div">
              <ListItem component="div">
                <Button
                  sx={{ ".MuiTouchRipple-child": { backgroundColor: theme.palette.trueWhite.alpha30 } }}
                  component={NavLink}
                  onClick={props.closeSidebar}
                  to={portfoliosAPIPath + portfolioBuilderEndpointSuffix}
                  startIcon={<AutoFixHighIcon />}
                >
                  Portfolio Builder
                </Button>
              </ListItem>
            </List>
          </SubMenuWrapper>
          {user.hasAccessRight(ADMINISTRATIVE_ACCESS) && (
            <>
              <Divider sx={{ mx: 2, background: theme.palette.trueWhite.alpha10 }} />
              <SubMenuWrapper>
                <List component="div">
                  <ListItem component="div">
                    <Button
                      sx={{ ".MuiTouchRipple-child": { backgroundColor: theme.palette.trueWhite.alpha30 } }}
                      component={NavLink}
                      onClick={props.closeSidebar}
                      to={usersAPIPath}
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
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ width: "100%" }}>
        <Divider sx={{ background: theme.palette.trueWhite.alpha10 }} />
        <Tooltip
          slots={{ tooltip: Card }}
          slotProps={{
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
            <Grid container columns={5} rowSpacing={0.5} sx={{ p: 1, alignItems: "flex-start" }}>
              {Object.entries(systemStatus.services).map(([service, status]) => (
                <Fragment key={service}>
                  <Grid size={2} sx={{ display: "flex", columnGap: 1 }}>
                    <StatusIndicator status={systemStatusLoading ? "N/A" : status.status} />
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {service}
                    </Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="body2">
                      {systemStatusLoading ? <Skeleton width="100%" /> : status.details}
                    </Typography>
                  </Grid>
                </Fragment>
              ))}
              <Grid size={5} sx={{ mt: 1 }}>
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
            sx={(theme) => ({
              m: 1,
              p: 1,
              width: `calc(100% - ${theme.spacing(2)})`,
              boxShadow: "none",
              background: "transparent",
              border: `1px solid ${theme.palette.trueWhite.alpha10}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing(1),
            })}
          >
            <StatusIndicator status={systemStatusLoading ? "N/A" : systemStatus.status.status} />
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", textAlign: "center", color: theme.palette.trueWhite.alpha70 }}
            >
              {systemStatusLoading ? "Loading…" : systemStatus.status.details}
            </Typography>
          </Card>
        </Tooltip>
      </Box>
    </>
  );
};

/**
 * Properties for the SidebarContent component.
 */
export interface SidebarContentProps {
  /**
   * Closes the sidebar.
   */
  closeSidebar: () => void;
}
