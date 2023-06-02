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
import ProfileSettings from "../../../../components/ProfileSettings";
import { sessionEndpointPath } from "@rating-tracker/commons";

const HeaderUserbox = (): JSX.Element => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { setNotification } = useContext(NotificationContext);
  const { user, clearUser } = useContext(UserContext);

  /**
   * Sign out the current user.
   */
  const signOut = async () => {
    try {
      // Delete the session
      await axios.delete(baseUrl + sessionEndpointPath);
      // This is only reached if signing out was successful
      clearUser();
      setNotification({
        severity: "success",
        title: "See you next time!",
        message: "Signed out successfully",
      });
      navigate("/login");
    } catch (e) {
      setNotification({
        severity: "error",
        title: "Error while signing out",
        message:
          e.response?.status && e.response?.data?.message
            ? `${e.response.status}: ${e.response.data.message}`
            : e.message ?? "No additional information available.",
      });
    }
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

export default HeaderUserbox;
