import LogoutIcon from "@mui/icons-material/Logout";
import type { SlideProps } from "@mui/material";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogTitle,
  Divider,
  Hidden,
  IconButton,
  Skeleton,
  Slide,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { sessionEndpointPath } from "@rating-tracker/commons";
import { useContext, useState } from "react";
import { useNavigate } from "react-router";

import NotificationContext from "../../../../contexts/NotificationContext";
import { UserContext } from "../../../../router";
import api from "../../../../utils/api";

import { ProfileSettings } from "./ProfileSettings";

export const HeaderUserbox = (): JSX.Element => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { setNotification, setErrorNotificationOrClearSession: setErrorNotification } = useContext(NotificationContext);
  const { user } = useContext(UserContext);
  const theme = useTheme();

  const fullScreenDialogs = !useMediaQuery("(min-width:664px)");

  /**
   * Sign out the current user.
   */
  const signOut = () => {
    // Delete the session
    api
      .delete(sessionEndpointPath)
      .then(() => {
        setNotification({
          severity: "success",
          title: "See you next time!",
          message: "Signed out successfully",
        });
        navigate("/");
      })
      .catch((e) => {
        setErrorNotification(e, "signing out");
      });
  };

  return (
    <Box sx={{ my: 1 }}>
      <Tooltip arrow title="Open Profile Settings">
        <Box display="inline-block">
          {/* Box required for tooltip to work on disabled button */}
          <Button
            sx={{ px: 1, ".MuiTouchRipple-child": { backgroundColor: theme.colors.alpha.trueWhite[30] } }}
            color="secondary"
            onClick={() => setOpen(true)}
            disabled={!user}
          >
            {user ? (
              <Avatar variant="rounded" alt={user.name} src={user.avatar} />
            ) : (
              <Skeleton variant="rounded" width={40} height={40} />
            )}
            <Hidden mdDown>
              <Box pl={1} textAlign="left">
                <Typography variant="body1" fontWeight="bold" color="text.primary" noWrap>
                  {user ? user.name : <Skeleton width={120} />}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user ? user.email : <Skeleton width={160} />}
                </Typography>
              </Box>
            </Hidden>
          </Button>
        </Box>
      </Tooltip>
      <Box display="inline-block" sx={{ ml: 1, my: 1 }}>
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
        TransitionComponent={fullScreenDialogs ? Slide : undefined}
        TransitionProps={{ direction: "up" } as SlideProps}
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
