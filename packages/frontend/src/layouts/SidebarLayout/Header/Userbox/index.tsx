import { useContext, useState } from "react";

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
  Tooltip,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationContext from "../../../../contexts/NotificationContext";
import { UserContext } from "../../../../router";
import axios from "axios";
import { baseUrl } from "../../../../router";
import { useNavigate } from "react-router";
import { ProfileSettings } from "./ProfileSettings";
import { sessionEndpointPath } from "@rating-tracker/commons";

export const HeaderUserbox = (): JSX.Element => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { setNotification, setErrorNotificationOrClearSession: setErrorNotification } = useContext(NotificationContext);
  const { user } = useContext(UserContext);

  /**
   * Sign out the current user.
   */
  const signOut = () => {
    void (async (): Promise<void> => {
      try {
        // Delete the session
        await axios.delete(baseUrl + sessionEndpointPath);
        // This is only reached if signing out was successful
        setNotification({
          severity: "success",
          title: "See you next time!",
          message: "Signed out successfully",
        });
        navigate("/");
      } catch (e) {
        setErrorNotification(e, "signing out");
      }
    })();
  };

  return (
    <Box sx={{ my: 1 }}>
      <Tooltip arrow title="Open Profile Settings">
        <Box display="inline-block">
          {/* Box required for tooltip to work on disabled button */}
          <Button color="secondary" sx={{ px: 1 }} onClick={() => setOpen(true)} disabled={!user}>
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
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xl">
        <DialogTitle>
          <Typography variant="h3">Profile Settings</Typography>
        </DialogTitle>
        <Divider />
        <ProfileSettings onClose={() => setOpen(false)} />
      </Dialog>
    </Box>
  );
};
