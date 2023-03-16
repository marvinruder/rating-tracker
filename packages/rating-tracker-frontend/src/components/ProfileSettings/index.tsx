import {
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../router";
import { baseUrl } from "../../router";
import { useNotification } from "../../contexts/NotificationContext";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  messageTypesAllowedWithGivenAccessRight,
  messageTypeDescription,
  messageTypeName,
  REGEX_PHONE_NUMBER,
  subscriptionOfMessageType,
  userEndpointPath,
} from "rating-tracker-commons";
import { convertAvatar } from "../../utils/imageManipulation";

/**
 * A dialog to edit the user’s own information.
 *
 * @param {ProfileSettingsProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const ProfileSettings = (props: ProfileSettingsProps): JSX.Element => {
  const { user, refetchUser } = useContext(UserContext);
  const { setNotification } = useNotification();

  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [name, setName] = useState<string>(user.name);
  const [nameError, setNameError] = useState<boolean>(false); // Error in the name text field.
  const [phone, setPhone] = useState<string>(user.phone);
  const [phoneError, setPhoneError] = useState<boolean>(false); // Error in the phone text field.
  const [avatar, setAvatar] = useState<string>(user.avatar);
  const [processingAvatar, setProcessingAvatar] = useState<boolean>(true);
  const [subscriptions, setSubscriptions] = useState<number>(user.subscriptions);

  const subscriptionSwitches: {
    subscription: number;
    name: string;
    description: string;
  }[] = [
    ...new Set( // deduplicate
      user
        .getAccessRights() // Get a list of all access rights
        .flatMap((accessRight) => messageTypesAllowedWithGivenAccessRight[accessRight]) // Map to list of message types
        .filter((messageType) => messageType !== undefined) // Filter out undefined values
    ),
  ].map(
    (messageType) =>
      messageType && {
        subscription: subscriptionOfMessageType[messageType],
        name: messageTypeName[messageType],
        description: messageTypeDescription[messageType],
      }
  );

  /**
   * Validates the name input field.
   *
   * @returns {boolean} Whether the name input field contains a valid name.
   */
  const validateName = () => {
    return (document.getElementById("inputName") as HTMLInputElement).reportValidity();
  };

  /**
   * Validates the phone input field.
   *
   * @returns {boolean} Whether the phone input field contains a valid phone number.
   */
  const validatePhone = () => {
    return (document.getElementById("inputPhone") as HTMLInputElement).reportValidity();
  };

  /**
   * Checks for errors in the input fields.
   */
  const validate = () => {
    // The following fields are required.
    setNameError(!validateName());
    setPhoneError(!validatePhone());
  };

  /**
   * Updates the user’s profile in the backend.
   */
  const updateProfile = () => {
    validate();
    if (validateName() && validatePhone()) {
      setRequestInProgress(true);
      axios
        .patch(
          baseUrl + userEndpointPath,
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
              subscriptions: subscriptions !== user.subscriptions ? subscriptions : undefined,
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
    }
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
      const processedAvatar = await convertAvatar(file);
      avatar === processedAvatar ? setProcessingAvatar(false) : setAvatar(processedAvatar);
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
        <Grid container mt={2} maxWidth="sm">
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
              <Tooltip title={user.avatar ? "Change your avatar" : "Upload an avatar"} arrow>
                <IconButton color="primary" component="label">
                  <input hidden accept="image/*" type="file" onChange={uploadAvatar} />
                  <AddAPhotoIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete your avatar" arrow>
                <IconButton color="error" sx={{ ml: 1, display: !avatar && "none" }} onClick={() => setAvatar("")}>
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
                <Tooltip title="To change your email address, please contact your administrator." arrow>
                  <TextField label="Email address" value={user.email} disabled fullWidth />
                </Tooltip>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="inputName"
                  onChange={(event) => {
                    setName(event.target.value);
                    setNameError(false);
                  }}
                  error={nameError}
                  label="Name"
                  value={name}
                  placeholder="Jane Doe"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="inputPhone"
                  type="tel"
                  inputProps={{
                    pattern: REGEX_PHONE_NUMBER,
                  }}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setPhoneError(false);
                  }}
                  error={phoneError}
                  label="Phone number"
                  value={phone}
                  placeholder="+12125550123"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} px="24px">
            <Divider orientation="horizontal" sx={{ my: 2 }} />
            <Typography variant="h4" pb={0.5}>
              Subscribe to notifications
            </Typography>
            <FormGroup>
              {subscriptionSwitches.map((subscriptionSwitch) => (
                <FormControlLabel
                  sx={{ pt: 1 }}
                  key={subscriptionSwitch.name}
                  control={
                    <Checkbox
                      checked={(subscriptions & subscriptionSwitch.subscription) === subscriptionSwitch.subscription}
                      onChange={() => setSubscriptions(subscriptions ^ subscriptionSwitch.subscription)}
                    />
                  }
                  label={
                    <>
                      <Typography variant="body1" fontWeight="bold" color="text.primary">
                        {subscriptionSwitch.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {subscriptionSwitch.description}
                      </Typography>
                    </>
                  }
                />
              ))}
            </FormGroup>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Notifications are sent via the instant messenger Signal. Be sure to enter the phone number of your Signal
              account in the field above.
            </Typography>
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
          disabled={
            // We cannot save if there are errors or if nothing has changed.
            nameError ||
            phoneError ||
            (name === user.name &&
              phone === user.phone &&
              avatar === user.avatar &&
              subscriptions === user.subscriptions)
          }
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
