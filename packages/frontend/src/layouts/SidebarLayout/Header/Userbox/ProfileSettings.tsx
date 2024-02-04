import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import LoadingButton from "@mui/lab/LoadingButton";
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
import {
  messageTypesAllowedWithGivenAccessRight,
  messageTypeDescription,
  messageTypeName,
  REGEX_PHONE_NUMBER,
  subscriptionOfMessageType,
  accountEndpointPath,
  accountAvatarEndpointSuffix,
} from "@rating-tracker/commons";
import { useEffect, useRef, useState } from "react";

import { useNotificationContextUpdater } from "../../../../contexts/NotificationContext";
import { useUserContextState, useUserContextUpdater } from "../../../../contexts/UserContext";
import api from "../../../../utils/api";
import ConvertAvatarWorker from "../../../../utils/imageManipulation?worker";

/**
 * A dialog to edit the user’s own information.
 *
 * @param {ProfileSettingsProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const ProfileSettings = (props: ProfileSettingsProps): JSX.Element => {
  const { user } = useUserContextState();
  const { refetchUser } = useUserContextUpdater();
  const { setNotification, setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(user.email);
  const [emailError, setEmailError] = useState<boolean>(false); // Error in the email text field.
  const [name, setName] = useState<string>(user.name);
  const [nameError, setNameError] = useState<boolean>(false); // Error in the name text field.
  const [phone, setPhone] = useState<string>(user.phone);
  const [phoneError, setPhoneError] = useState<boolean>(false); // Error in the phone text field.
  const [processingAvatar, setProcessingAvatar] = useState<boolean>(true);
  const [subscriptions, setSubscriptions] = useState<number>(user.subscriptions);

  const inputEmail = useRef<HTMLInputElement>(null);
  const inputName = useRef<HTMLInputElement>(null);
  const inputPhone = useRef<HTMLInputElement>(null);

  const subscriptionSwitches: {
    subscription: number;
    name: string;
    description: string;
  }[] = [
    ...new Set( // deduplicate
      user
        .getAccessRights() // Get a list of all access rights
        .flatMap((accessRight) => messageTypesAllowedWithGivenAccessRight[accessRight]) // Map to list of message types
        .filter((messageType) => messageType !== undefined), // Filter out undefined values
    ),
  ].map(
    (messageType) =>
      messageType && {
        subscription: subscriptionOfMessageType[messageType],
        name: messageTypeName[messageType],
        description: messageTypeDescription[messageType],
      },
  );

  /**
   * Checks for errors in the input fields.
   *
   * @returns {boolean} Whether the input fields are valid.
   */
  const validate = (): boolean => {
    // The following fields are required.
    setEmailError(!inputEmail.current.reportValidity());
    setNameError(!inputName.current.reportValidity());
    setPhoneError(!inputPhone.current.reportValidity());
    return (
      inputEmail.current.reportValidity() && inputName.current.reportValidity() && inputPhone.current.reportValidity()
    );
  };

  /**
   * Updates the user’s profile in the backend.
   */
  const updateProfile = () => {
    if (!validate()) return;
    setRequestInProgress(true);
    api
      .patch(accountEndpointPath, {
        params: {
          // Only send the parameters that have changed.
          email: email !== user.email ? email.trim() : undefined,
          name: name !== user.name ? name.trim() : undefined,
          phone: phone !== user.phone ? phone.trim() : undefined,
          subscriptions: subscriptions !== user.subscriptions ? subscriptions : undefined,
        },
      })
      .then(
        () => (
          refetchUser(),
          setNotification({
            severity: "success",
            title: "Profile updated",
            message: "Your profile has been updated successfully.",
          }),
          props.onClose()
        ), // Update the user in the context, show a notification, and close the dialog on success.
      )
      .catch((e) => setErrorNotificationOrClearSession(e, "updating user"))
      .finally(() => setRequestInProgress(false));
  };

  useEffect(() => {
    // Wait for the avatar to be loaded before removing the circular progress indicator to prevent a visual glitch.
    setProcessingAvatar(false);
  }, [user.avatar]);

  /**
   * Resizes and stores the uploaded avatar in the state as a base64 string.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e The upload event.
   */
  const uploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProcessingAvatar(true);

    const file = e.target.files?.[0];
    if (!file) {
      setProcessingAvatar(false);
      return;
    }

    const worker = new ConvertAvatarWorker();
    worker.postMessage(file);
    worker.onmessage = async (message: MessageEvent<{ result: Uint8Array } | { isError: true }>) => {
      if (!("result" in message.data)) {
        setNotification({
          severity: "error",
          title: "Error while processing image",
          message: "Refer to the error console for detailed information.",
        });
        setProcessingAvatar(false);
      } else {
        api
          .put(accountEndpointPath + accountAvatarEndpointSuffix, {
            body: message.data.result,
            headers: { "Content-Type": "image/avif" },
          })
          .then(() => refetchUser(Date.now()))
          .catch((e) => setErrorNotificationOrClearSession(e, "uploading account avatar"))
          .finally(() => setProcessingAvatar(false));
      }
      // Clear the file input to allow the same file to be uploaded again.
      e.target.value = "";
      worker.terminate();
    };
  };

  /**
   * Deletes the avatar of the current user from the backend.
   *
   * @returns {Promise<void>}
   */
  const deleteAvatar = (): Promise<void> =>
    api
      .delete(accountEndpointPath + accountAvatarEndpointSuffix)
      .then(() => refetchUser())
      .catch((e) => setErrorNotificationOrClearSession(e, "deleting account avatar"));

  return (
    <>
      <DialogContent sx={{ p: 0, pb: 2 }}>
        <Grid container mt={2} maxWidth="sm">
          <Grid item xs={12} sm={6} md={4}>
            {processingAvatar ? (
              <Avatar sx={{ width: 120, height: 120, margin: "auto" }}>
                <CircularProgress />
              </Avatar>
            ) : (
              <Avatar sx={{ width: 120, height: 120, margin: "auto" }} alt={user.name} src={user.avatar} />
            )}
            <Box width="100%" display="flex" justifyContent="center" mt={1}>
              <Tooltip title={user.avatar ? "Change your avatar" : "Upload an avatar"} arrow>
                <Box>
                  <IconButton
                    color="primary"
                    component="label"
                    disabled={processingAvatar}
                    // Cache the WASM module including the huge `.wasm` file
                    onMouseDown={() => void import("@rating-tracker/wasm")}
                  >
                    <input hidden accept="image/jpeg, image/png, image/tiff" type="file" onChange={uploadAvatar} />
                    <AddAPhotoIcon />
                  </IconButton>
                </Box>
              </Tooltip>
              <Tooltip title="Delete your avatar" arrow>
                <Box>
                  <IconButton
                    color="error"
                    sx={{ ml: 1, display: !user.avatar && "none" }}
                    onClick={deleteAvatar}
                    disabled={processingAvatar}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={8}>
            <Grid container spacing={2} mt={0} pl={{ xs: "24px", sm: 0 }} pr="24px">
              <Grid item xs={12}>
                <TextField
                  inputRef={inputEmail}
                  type="email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setEmailError(false);
                  }}
                  error={emailError}
                  label="Email address"
                  value={email}
                  placeholder="jane.doe@example.com"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  inputRef={inputName}
                  onChange={(event) => {
                    setName(event.target.value);
                    setNameError(false);
                  }}
                  error={nameError}
                  label="Name"
                  autoComplete="name"
                  value={name}
                  placeholder="Jane Doe"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  inputRef={inputPhone}
                  type="tel"
                  inputProps={{ pattern: REGEX_PHONE_NUMBER }}
                  onChange={(event) => {
                    setPhone(event.target.value.replaceAll(/[^0-9+]+/g, "").substring(0, 16));
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
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={props.onClose}>Cancel</Button>
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={updateProfile}
          onMouseOver={validate} // Validate input fields on hover
          disabled={
            // We cannot save if there are errors or if nothing has changed.
            emailError ||
            nameError ||
            phoneError ||
            (email === user.email && name === user.name && phone === user.phone && subscriptions === user.subscriptions)
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
