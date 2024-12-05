import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkOffIcon from "@mui/icons-material/LinkOff";
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
  Grid2 as Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  handleResponse,
  messageTypesAllowedWithGivenAccessRight,
  messageTypeDescription,
  messageTypeName,
  REGEX_PHONE_NUMBER,
  subscriptionOfMessageType,
  basePath,
  authAPIPath,
  oidcEndpointSuffix,
} from "@rating-tracker/commons";
import { useEffect, useRef, useState } from "react";

import accountClient from "../../../../api/account";
import OpenIDConnectIcon from "../../../../components/etc/OpenIDConnect";
import { useNotificationContextUpdater } from "../../../../contexts/NotificationContext";
import { useStatusContextState } from "../../../../contexts/StatusContext";
import { useUserContextState, useUserContextUpdater } from "../../../../contexts/UserContext";
import ConvertAvatarWorker from "../../../../utils/imageManipulation?worker";

/**
 * A dialog to edit the user’s own information.
 * @param props The properties of the component.
 * @returns The component.
 */
export const ProfileSettings = (props: ProfileSettingsProps): React.JSX.Element => {
  const { systemStatus } = useStatusContextState();
  const { user } = useUserContextState();
  const { refetchUser } = useUserContextUpdater();
  const { setNotification, setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [oidcRequestInProgress, setOIDCRequestInProgress] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(user.email);
  const [emailError, setEmailError] = useState<string>(""); // Error message for the email text field.
  const [name, setName] = useState<string>(user.name);
  const [nameError, setNameError] = useState<string>(""); // Error message for the name text field.
  const [phone, setPhone] = useState<string | null>(user.phone);
  const [phoneError, setPhoneError] = useState<string>(""); // Error message for the phone text field.
  const [processingAvatar, setProcessingAvatar] = useState<boolean>(true);
  const [subscriptions, setSubscriptions] = useState<number | null>(user.subscriptions);

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
   * @returns Whether the input fields are valid.
   */
  const validate = (): boolean => {
    const isEmailValid = inputEmail.current?.checkValidity() ?? false;
    const isNameValid = inputName.current?.checkValidity() ?? false;
    const isPhoneValid = inputPhone.current?.checkValidity() ?? false;
    return isEmailValid && isNameValid && isPhoneValid;
  };

  /**
   * Updates the user’s profile in the backend.
   */
  const updateProfile = () => {
    if (!validate()) return;
    setRequestInProgress(true);
    accountClient.index
      .$patch({
        json: {
          // Only send the parameters that have changed.
          ...(email !== user.email ? { email: email.trim() } : {}),
          ...(name !== user.name ? { name: name.trim() } : {}),
          ...(phone !== user.phone ? { phone: phone?.trim() || null } : {}),
          ...(subscriptions !== user.subscriptions ? { subscriptions } : {}),
        },
      })
      .then(handleResponse)
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
   * @param e The upload event.
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
    worker.onmessage = async (message: MessageEvent<{ result: Uint8Array } | { error: Error }>) => {
      if ("result" in message.data) {
        accountClient.avatar
          .$put({ header: { "content-type": "image/avif" } }, { init: { body: message.data.result } })
          .then(handleResponse)
          .then(() => refetchUser(Date.now()))
          .catch((e) => setErrorNotificationOrClearSession(e, "uploading account avatar"))
          .finally(() => setProcessingAvatar(false));
      } else {
        setNotification({
          severity: "error",
          title: "Error while processing image",
          message: message.data.error.message,
        });
        setProcessingAvatar(false);
      }
      // Clear the file input to allow the same file to be uploaded again.
      e.target.value = "";
      worker.terminate();
    };
  };

  /**
   * Deletes the avatar of the current user from the backend.
   * @returns a {@link Promise} that resolves when the avatar has been deleted and the user refetch has been triggered.
   */
  const deleteAvatar = (): Promise<void> =>
    accountClient.avatar
      .$delete()
      .then(handleResponse)
      .then(() => refetchUser())
      .catch((e) => setErrorNotificationOrClearSession(e, "deleting account avatar"));

  /**
   * Disconnects the OpenID Connect identity from the current user in the backend.
   */
  const disconnectOIDCIdentity = () => {
    setOIDCRequestInProgress(true);
    accountClient.oidc
      .$delete()
      .then(handleResponse)
      .then(() => refetchUser())
      .catch((e) => setErrorNotificationOrClearSession(e, "disconnecting OpenID Connect identity"))
      .finally(() => setOIDCRequestInProgress(false));
  };

  return (
    <>
      <DialogContent sx={{ p: 0, pb: 2 }}>
        <Grid container sx={{ mt: 2, maxWidth: "sm" }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {processingAvatar ? (
              <Avatar sx={{ width: 120, height: 120, margin: "auto" }}>
                <CircularProgress />
              </Avatar>
            ) : (
              <Avatar sx={{ width: 120, height: 120, margin: "auto" }} alt={user.name} src={user.avatar ?? undefined} />
            )}
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center", mt: 1 }}>
              <Tooltip title={user.avatar ? "Change your avatar" : "Upload an avatar"} arrow>
                <Box id="upload-avatar-label">
                  <IconButton
                    aria-labelledby="upload-avatar-label"
                    color="primary"
                    component="label"
                    role={undefined}
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
                <Box id="delete-avatar-label">
                  <IconButton
                    aria-labelledby="delete-avatar-label"
                    color="error"
                    sx={{ ml: 1, display: !user.avatar ? "none" : undefined }}
                    onClick={deleteAvatar}
                    disabled={processingAvatar}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Tooltip>
            </Box>
          </Grid>
          <Grid
            container
            size={{ xs: 12, sm: 6, md: 8 }}
            spacing={2}
            sx={{ alignContent: "center", pl: { xs: "24px", sm: 0 }, pr: "24px" }}
          >
            <Grid size={12}>
              <TextField
                inputRef={inputEmail}
                type="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  // If in error state, check whether error is resolved. If so, clear the error.
                  if (emailError && event.target.checkValidity()) setEmailError("");
                }}
                onInvalid={(event) => setEmailError((event.target as HTMLInputElement).validationMessage)}
                error={!!emailError}
                helperText={emailError}
                label="Email address"
                value={email}
                placeholder="jane.doe@example.com"
                fullWidth
                required
              />
            </Grid>
            <Grid size={12}>
              <TextField
                inputRef={inputName}
                onChange={(event) => {
                  setName(event.target.value);
                  // If in error state, check whether error is resolved. If so, clear the error.
                  if (nameError && event.target.checkValidity()) setNameError("");
                }}
                onInvalid={(event) => setNameError((event.target as HTMLInputElement).validationMessage)}
                error={!!nameError}
                helperText={nameError}
                label="Name"
                autoComplete="name"
                value={name}
                placeholder="Jane Doe"
                fullWidth
                required
              />
            </Grid>
            <Grid size={12}>
              <TextField
                inputRef={inputPhone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  // If in error state, check whether error is resolved. If so, clear the error.
                  if (phoneError && event.target.checkValidity()) setPhoneError("");
                }}
                onInvalid={(event) => setPhoneError((event.target as HTMLInputElement).validationMessage)}
                error={!!phoneError}
                helperText={phoneError}
                label="Phone number"
                value={phone}
                placeholder="+12125550123"
                fullWidth
                slotProps={{ htmlInput: { inputMode: "tel", type: "tel", pattern: REGEX_PHONE_NUMBER } }}
              />
            </Grid>
            {systemStatus.services["OpenID Connect"].status === "success" && (
              <Grid size={12}>
                <Typography variant="h5" sx={{ pb: 0.5 }}>
                  OpenID Connect
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                  {user.oidcIdentity ? (
                    <>
                      <Tooltip title="OpenID Connect Identity" arrow>
                        <Box sx={(theme) => ({ height: 1.5 * (theme.typography.body1.fontSize as number) })}>
                          <OpenIDConnectIcon
                            sx={(theme) => ({ fontSize: 1.5 * (theme.typography.body1.fontSize as number) })}
                          />
                        </Box>
                      </Tooltip>
                      <Box sx={{ width: 8 }} />
                      <Typography variant="body1" noWrap sx={{}}>
                        {user.oidcIdentity.preferredUsername}
                      </Typography>
                      <LoadingButton
                        sx={{ ml: "auto" }}
                        variant="text"
                        color="error"
                        size="small"
                        onClick={disconnectOIDCIdentity}
                        loading={oidcRequestInProgress}
                        startIcon={<LinkOffIcon />}
                      >
                        Disconnect
                      </LoadingButton>
                    </>
                  ) : (
                    <LoadingButton
                      loading={oidcRequestInProgress}
                      startIcon={oidcRequestInProgress ? undefined : <OpenIDConnectIcon />}
                      variant="text"
                      size="small"
                      href={`${basePath}${authAPIPath}${oidcEndpointSuffix}`}
                    >
                      Connect
                    </LoadingButton>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
          <Grid size={12} sx={{ px: "24px" }}>
            <Divider orientation="horizontal" sx={{ my: 2 }} />
            <Typography variant="h4" sx={{ pb: 0.5 }}>
              Subscribe to notifications
            </Typography>
            <FormGroup>
              {subscriptionSwitches.map((subscriptionSwitch) => (
                <FormControlLabel
                  sx={{ pt: 1 }}
                  key={subscriptionSwitch.name}
                  control={
                    <Checkbox
                      checked={
                        ((subscriptions ?? 0) & subscriptionSwitch.subscription) === subscriptionSwitch.subscription
                      }
                      onChange={() => setSubscriptions((subscriptions ?? 0) ^ subscriptionSwitch.subscription)}
                    />
                  }
                  label={
                    <>
                      <Typography variant="body1" sx={{ fontWeight: "bold", color: "text.primary" }}>
                        {subscriptionSwitch.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {subscriptionSwitch.description}
                      </Typography>
                    </>
                  }
                />
              ))}
            </FormGroup>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              Notifications are sent via the instant messenger Signal. Be sure to enter the phone number of your Signal
              account in the field above.
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={props.onClose} sx={{ mr: "auto" }}>
          Cancel
        </Button>
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={updateProfile}
          disabled={
            // We cannot save if there are errors or if nothing has changed.
            !!emailError ||
            !!nameError ||
            !!phoneError ||
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

/**
 * Properties for the ProfileSettings component.
 */
interface ProfileSettingsProps {
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
}
