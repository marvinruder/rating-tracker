import FingerprintIcon from "@mui/icons-material/Fingerprint";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Card, CardContent, Grid2 as Grid, TextField, Typography, useTheme } from "@mui/material";
import { handleResponse } from "@rating-tracker/commons";
import * as SimpleWebAuthnBrowser from "@simplewebauthn/browser";
import type { Dispatch, SetStateAction } from "react";
import { useRef, useState } from "react";

import authClient from "../../api/auth";
import { SwitchSelector } from "../../components/etc/SwitchSelector";
import { useNotificationContextUpdater } from "../../contexts/NotificationContext";
import { useUserContextUpdater } from "../../contexts/UserContext";

/**
 * This component renders the login page.
 * @returns The component.
 */
export const LoginPage = (): JSX.Element => {
  const [action, setAction] = useState<"signIn" | "register">("signIn");
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>(""); // Error message for the email text field.
  const [nameError, setNameError] = useState<string>(""); // Error message for the name text field.
  const { setNotification, setErrorNotificationOrClearSession } = useNotificationContextUpdater();
  const { refetchUser } = useUserContextUpdater();

  const theme = useTheme();

  const inputEmail = useRef<HTMLInputElement>(null);
  const inputName = useRef<HTMLInputElement>(null);

  /**
   * Validates the input fields.
   * @returns Whether the input fields are valid.
   */
  const validate = (): boolean => {
    if (action === "register") {
      const isEmailValid = inputEmail.current?.checkValidity() ?? false;
      const isNameValid = inputName.current?.checkValidity() ?? false;
      return isEmailValid && isNameValid;
    }
    return true;
  };

  /**
   * Handles the click event of the login / register button.
   */
  const onButtonClick = () => {
    void (async (): Promise<void> => {
      // Validate input fields
      if (!validate()) return;
      setRequestInProgress(true);
      switch (action) {
        case "register":
          try {
            // Request registration challenge
            const res = await authClient.register
              .$get({ query: { email: email.trim(), name: name.trim() } })
              .then(handleResponse);
            // Ask the browser to perform the WebAuthn registration and store a corresponding credential
            const authRes = await SimpleWebAuthnBrowser.startRegistration({ optionsJSON: res.data });
            try {
              // Send the registration challenge response to the server
              await authClient.register
                .$post({ json: authRes, query: { email: email.trim(), name: name.trim() } })
                .then(handleResponse);
              // This is only reached if the registration was successful
              setNotification({
                severity: "success",
                title: "Welcome!",
                message:
                  "Your registration was successful. Please note that a manual activation of your account may " +
                  "still be necessary before you can access the page.",
              });
            } catch (e) {
              setErrorNotificationOrClearSession(e, "processing registration response");
            }
          } catch (e) {
            setErrorNotificationOrClearSession(e, "requesting registration challenge");
          } finally {
            setRequestInProgress(false);
          }
          break;
        case "signIn":
          try {
            // Request authentication challenge
            const res = await authClient.signIn.$get().then(handleResponse);
            // Ask the browser to perform the WebAuthn authentication
            const authRes = await SimpleWebAuthnBrowser.startAuthentication({ optionsJSON: res.data });
            try {
              // Send the authentication challenge response to the server
              await authClient.signIn.$post({ json: authRes }).then(handleResponse);
              // This is only reached if the authentication was successful
              setNotification(undefined);
              await refetchUser(); // After refetching, the user is redirected automatically
            } catch (e) {
              setErrorNotificationOrClearSession(e, "processing authorization response");
            }
          } catch (e) {
            setErrorNotificationOrClearSession(e, "requesting authentication challenge");
          } finally {
            setRequestInProgress(false);
          }
          break;
      }
    })();
  };

  return (
    <Card sx={{ margin: "auto", minWidth: 275, background: theme.palette.white.alpha50, backdropFilter: "blur(3px)" }}>
      <CardContent>
        <Grid container direction="column" spacing={2} sx={{ padding: 1 }}>
          <Grid>
            <Box sx={{ display: "flex", justifyContent: "center", fontSize: 96 }}>
              <QueryStatsIcon fontSize="inherit" />
            </Box>
          </Grid>
          <Grid>
            <Typography variant="h3" sx={{ fontSize: 24, lineHeight: 1.6, textAlign: "center" }}>
              Rating Tracker
            </Typography>
          </Grid>
          <Grid>
            <SwitchSelector
              value={action}
              setValue={setAction as Dispatch<SetStateAction<string>>}
              leftValue="signIn"
              leftLabel="Sign in"
              rightValue="register"
              rightLabel="Register"
            />
          </Grid>
          <Grid container direction="column" spacing={0}>
            <Grid
              sx={{
                transitionProperty: "max-height,opacity",
                transitionDuration: ".4s,.2s",
                transitionTimingFunction: `ease`,
                ...(action === "register"
                  ? { maxHeight: 60, opacity: 1, transitionDelay: "0s,.2s" }
                  : { maxHeight: 0, opacity: 0 }),
              }}
            >
              <TextField
                inputRef={inputEmail}
                sx={{ mb: 1 }}
                fullWidth
                type="email"
                label="Email Address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  // If in error state, check whether error is resolved. If so, clear the error.
                  if (emailError && event.target.checkValidity()) setEmailError("");
                }}
                onInvalid={(event) => setEmailError((event.target as HTMLInputElement).validationMessage)}
                error={!!emailError}
                helperText={emailError}
                required
              />
            </Grid>
            <Grid
              sx={{
                transitionProperty: "max-height,opacity",
                transitionDuration: ".4s,.2s",
                transitionTimingFunction: `ease`,
                ...(action === "register"
                  ? { maxHeight: 60, opacity: 1, transitionDelay: "0s,.2s" }
                  : { maxHeight: 0, opacity: 0 }),
              }}
            >
              <TextField
                inputRef={inputName}
                sx={{ mb: 1 }}
                fullWidth
                label="Name"
                autoComplete="name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  // If in error state, check whether error is resolved. If so, clear the error.
                  if (nameError && event.target.checkValidity()) setNameError("");
                }}
                onInvalid={(event) => setNameError((event.target as HTMLInputElement).validationMessage)}
                error={!!nameError}
                helperText={nameError}
                required
              />
            </Grid>
            <Grid>
              <LoadingButton
                loading={requestInProgress}
                startIcon={<FingerprintIcon />}
                variant="contained"
                disabled={action === "register" && (!!emailError || !!nameError)}
                fullWidth
                onClick={onButtonClick}
              >
                {action === "signIn" ? "Sign in" : "Register"}
              </LoadingButton>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
