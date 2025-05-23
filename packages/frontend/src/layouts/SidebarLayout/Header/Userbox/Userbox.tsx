import LogoutIcon from "@mui/icons-material/Logout";
import type { SlideProps } from "@mui/material";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogTitle,
  Divider,
  IconButton,
  Skeleton,
  Slide,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { handleResponse } from "@rating-tracker/commons";
import { useState } from "react";

import sessionClient from "../../../../api/session";
import { useNotificationContextUpdater } from "../../../../contexts/NotificationContext";
import { useUserContextState, useUserContextUpdater } from "../../../../contexts/UserContext";

import { ProfileSettings } from "./ProfileSettings";

export const HeaderUserbox = (): React.JSX.Element => {
  const [open, setOpen] = useState(false);
  const { setNotification, setErrorNotificationOrClearSession } = useNotificationContextUpdater();
  const { user } = useUserContextState();
  const { clearUser } = useUserContextUpdater();
  const theme = useTheme();

  const fullScreenDialogs = !useMediaQuery("(min-width:664px)");

  /**
   * Sign out the current user.
   */
  const signOut = () => {
    // Delete the session
    sessionClient.index
      .$delete()
      .then(async (res) => {
        if (res.status === 200) {
          const { frontchannelLogoutURI } = (await handleResponse(res)).data;
          if (URL.canParse(frontchannelLogoutURI)) window.location.href = frontchannelLogoutURI;
        } else {
          await handleResponse(res);
          setNotification({
            severity: "success",
            title: "See you next time!",
            message: "Signed out successfully",
          });
          clearUser();
        }
      })
      .catch((e) => {
        setErrorNotificationOrClearSession(e, "signing out");
      });
  };

  return (
    <Box sx={{ my: 1 }}>
      <Tooltip arrow title="Open Profile Settings">
        <Box sx={{ display: "inline-block" }}>
          {/* Box required for tooltip to work on disabled button */}
          <Button
            sx={{
              px: 1,
              backgroundColor: "transparent",
              "&:hover:not(:disabled)": { backgroundColor: alpha(theme.palette.secondary.main, 0.1) },
              ".MuiTouchRipple-child": { backgroundColor: theme.palette.trueWhite.alpha30 },
            }}
            onClick={() => setOpen(true)}
            disabled={!user}
          >
            {user ? (
              <Avatar variant="rounded" alt={user.name} src={user.avatar ?? undefined} />
            ) : (
              <Skeleton variant="rounded" width={40} height={40} />
            )}
            <Box sx={{ display: { xs: "none", md: "block" }, pl: 1, textAlign: "left" }}>
              <Typography variant="body1" noWrap sx={{ fontWeight: "bold", color: "text.primary" }}>
                {user ? user.name : <Skeleton width={120} />}
              </Typography>
              <Typography variant="body2" noWrap sx={{ color: "text.secondary" }}>
                {user ? user.email : <Skeleton width={160} />}
              </Typography>
            </Box>
          </Button>
        </Box>
      </Tooltip>
      <Box sx={{ display: "inline-block", ml: 1, my: 1 }}>
        <Tooltip arrow title="Sign out">
          <IconButton color="primary" onClick={signOut}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen={fullScreenDialogs}
        slots={{ transition: fullScreenDialogs ? Slide : undefined }}
        slotProps={{ transition: { direction: "up" } as SlideProps }}
      >
        <DialogTitle>
          <Typography variant="h3">Profile Settings</Typography>
        </DialogTitle>
        <Divider />
        <ProfileSettings onClose={() => setOpen(false)} />
      </Dialog>
    </Box>
  );
};
