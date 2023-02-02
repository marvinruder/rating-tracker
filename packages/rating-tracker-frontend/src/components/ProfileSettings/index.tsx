import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import SidebarContext from "../../contexts/SidebarContext.js";
import { baseUrl, userAPI } from "../../endpoints.js";
import useNotification from "../../helpers/useNotification.js";
import LoadingButton from "@mui/lab/LoadingButton";

/**
 * A dialog to edit the user’s own information.
 *
 * @param {ProfileSettingsProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const ProfileSettings = (props: ProfileSettingsProps): JSX.Element => {
  const { user, refetchUser } = useContext(SidebarContext);
  const { setNotification } = useNotification();

  if (!user) {
    // This should not happen, since the profile button is disabled without a user being present, but if it does, we
    // don’t want to crash the app.
    setNotification({
      severity: "error",
      title: "Error while loading user",
      message:
        "User information is not available at this time. Please try again later.",
    });
    props.onClose();
    return <></>;
  }

  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [name, setName] = useState<string>(user.name);
  const [nameError, setNameError] = useState<boolean>(false); // Error in the name text field.
  const [phone, setPhone] = useState<string>(user.phone);
  const [avatar, setAvatar] = useState<string>(user.avatar);
  const [processingAvatar, setProcessingAvatar] = useState<boolean>(true);

  /**
   * Checks for errors in the input fields.
   */
  const validate = () => {
    // The following fields are required.
    setNameError(!name);
    // TODO Validate phone number for international standard.
  };

  /**
   * Updates the user’s profile in the backend.
   */
  const updateProfile = () => {
    setRequestInProgress(true),
      axios
        .patch(
          baseUrl + userAPI,
          avatar !== user.avatar
            ? {
                avatar, // Include payload with avatar only if it has changed.
              }
            : undefined,
          {
            params: {
              // Only send the parameters that have changed.
              name: name !== user.name ? name : undefined,
              phone: phone !== user.phone ? phone : undefined,
            },
          }
        )
        .then(
          () => (
            refetchUser(),
            setNotification({
              severity: "success",
              title: "Profile updated",
              message: "Your profile has been updated successfully.",
            }),
            props.onClose()
          )
        ) // Update the user in the context, show a notification, and close the dialog on success.
        .catch((e) => {
          setNotification({
            severity: "error",
            title: "Error while updating user",
            message:
              e.response?.status && e.response?.data?.message
                ? `${e.response.status}: ${e.response.data.message}`
                : e.message ?? "No additional information available.",
          });
        })
        .finally(() => setRequestInProgress(false));
  };

  useEffect(() => {
    // Wait for the avatar to be loaded before removing the circular progress indicator to prevent a visual glitch.
    setProcessingAvatar(false);
  }, [avatar]);

  /**
   * Resizes and stores the uploaded avatar in the state as a base64 string.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e The upload event.
   */
  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setProcessingAvatar(true);

      const file = e.target.files?.[0];
      if (!file) {
        setProcessingAvatar(false);
        return;
      }
      // We need to use the browser version of Jimp here, since the Node version is not compatible with the browser.
      // Unfortunately, type declarations are not available for this setup right now.
      const Jimp = await import("jimp/browser/lib/jimp.js");
      const image = await Jimp.read(await file.arrayBuffer());
      image
        .cover(480, 480) // Resize to a comfortable size of 480x480px while cutting off the excess.
        .quality(60) // Reduce the quality to 60%.
        .getBase64(Jimp.MIME_JPEG, (e: Error, src: string) => {
          if (e) {
            throw e;
          }
          avatar === src ? setProcessingAvatar(false) : setAvatar(src);
        });
    } catch (e) {
      setNotification({
        severity: "error",
        title: "Error while processing image",
        message:
          e.response?.status && e.response?.data?.message
            ? `${e.response.status}: ${e.response.data.message}`
            : e.message ?? "No additional information available.",
      });
      setProcessingAvatar(false);
    } finally {
      // Clear the file input to allow the same file to be uploaded again.
      e.target.value = "";
    }
  };

  return (
    <>
      <DialogContent sx={{ p: 0, pb: 2 }}>
        <Grid container mt={2} maxWidth={"sm"}>
          <Grid item xs={12} sm={6} md={4}>
            {processingAvatar ? (
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: "auto",
                }}
              >
                {/* Disable animation because of high CPU load. */}
                <CircularProgress disableShrink />
              </Avatar>
            ) : (
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: "auto",
                }}
                alt={user.name}
                src={avatar}
              />
            )}
            <Box width="100%" display="flex" justifyContent="center" mt={1}>
              <Tooltip
                title={user.avatar ? "Change your avatar" : "Upload an avatar"}
                arrow
              >
                <IconButton color="primary" component="label">
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={uploadAvatar}
                  />
                  <AddAPhotoIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete your avatar" arrow>
                <IconButton
                  color="error"
                  sx={{ ml: 1, display: !avatar && "none" }}
                  onClick={() => setAvatar("")}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={8}>
            <Grid
              container
              spacing={2}
              mt={0}
              pl={{
                xs: "24px",
                sm: 0,
              }}
              pr="24px"
            >
              <Grid item xs={12}>
                <Tooltip
                  title="To change your email address, please contact your administrator."
                  arrow
                >
                  <TextField
                    label="Email address"
                    value={user.email}
                    disabled
                    fullWidth
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  onChange={(event) => {
                    setName(event.target.value);
                    setNameError(false);
                  }}
                  error={nameError}
                  label="Name"
                  value={name}
                  placeholder={"Jane Doe"}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  onChange={(event) => {
                    setPhone(event.target.value);
                  }}
                  label="Phone number"
                  value={phone}
                  placeholder={"+1 (212) 555-0123"}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 0 }}>
        <Button onClick={props.onClose}>Cancel</Button>
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={updateProfile}
          onMouseOver={validate} // Validate input fields on hover
          disabled={nameError}
          startIcon={<SaveIcon />}
        >
          Update Profile
        </LoadingButton>
      </DialogActions>
    </>
  );
};

interface ProfileSettingsProps {
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
}

export default ProfileSettings;
