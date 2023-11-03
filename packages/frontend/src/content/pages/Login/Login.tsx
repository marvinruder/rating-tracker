import FingerprintIcon from "@mui/icons-material/Fingerprint";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import { LoadingButton } from "@mui/lab";
import { Box, Card, CardContent, Grid, TextField, Typography } from "@mui/material";
import { registerEndpointPath, signInEndpointPath } from "@rating-tracker/commons";
import * as SimpleWebAuthnBrowser from "@simplewebauthn/browser";
import { useContext, useState } from "react";

import { SwitchSelector } from "../../../components/etc/SwitchSelector";
import { useNotification } from "../../../contexts/NotificationContext";
import { UserContext } from "../../../router";
import api from "../../../utils/api";

/**
 * This component renders the login page.
 *
 * @returns {JSX.Element} The component.
 */
export const LoginPage = (): JSX.Element => {
  const [action, setAction] = useState<"signIn" | "register">("signIn");
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<boolean>(false);
  const [nameError, setNameError] = useState<boolean>(false);
  const { setNotification, setErrorNotificationOrClearSession: setErrorNotification } = useNotification();
  const { refetchUser } = useContext(UserContext);

  /**
   * Validates the email input field.
   *
   * @returns {boolean} Whether the email input field contains a valid email address.
   */
  const validateEmail = (): boolean => {
    return (document.getElementById("inputEmail") as HTMLInputElement).reportValidity();
  };

  /**
   * Validates the name input field.
   *
   * @returns {boolean} Whether the name input field contains a valid name.
   */
  const validateName = (): boolean => {
    return (document.getElementById("inputName") as HTMLInputElement).reportValidity();
  };

  /**
   * Validates the input fields.
   */
  const validate = () => {
    if (action === "register") {
      setEmailError(!validateEmail());
      setNameError(!validateName());
    }
  };

  /**
   * Handles the click event of the login / register button.
   */
  const onButtonClick = () => {
    void (async (): Promise<void> => {
      setRequestInProgress(true);
      switch (action) {
        case "register":
          // Validate input fields
          validate();
          if (validateEmail() && validateName()) {
            try {
              // Request registration challenge
              const res = await api.get(registerEndpointPath, {
                params: { email: email.trim(), name: name.trim() },
              });
              // Ask the browser to perform the WebAuthn registration and store a corresponding credential
              const authRes = await SimpleWebAuthnBrowser.startRegistration(res.data);
              try {
                // Send the registration challenge response to the server
                await api.post(registerEndpointPath, authRes, {
                  params: { email: email.trim(), name: name.trim() },
                  headers: { "Content-Type": "application/json" },
                });
                // This is only reached if the registration was successful
                setNotification({
                  severity: "success",
                  title: "Welcome!",
                  message:
                    "Your registration was successful. Please note that a manual activation of your account may " +
                    "still be necessary before you can access the page.",
                });
              } catch (e) {
                setErrorNotification(e, "processing registration response");
              }
            } catch (e) {
              setErrorNotification(e, "requesting registration challenge");
            } finally {
              setRequestInProgress(false);
            }
          }
          break;
        case "signIn":
          try {
            // Request authentication challenge
            const res = await api.get(signInEndpointPath);
            // Ask the browser to perform the WebAuthn authentication
            const authRes = await SimpleWebAuthnBrowser.startAuthentication(res.data);
            try {
              // Send the authentication challenge response to the server
              await api.post(
                signInEndpointPath,
                { ...authRes, challenge: res.data.challenge },
                { headers: { "Content-Type": "application/json" } },
              );
              // This is only reached if the authentication was successful
              setNotification({
                severity: "success",
                title: "Welcome back!",
                message: "Authentication successful",
              });
              refetchUser(); // After refetching, the user is redirected automatically
            } catch (e) {
              setErrorNotification(e, "processing authorization response");
            }
          } catch (e) {
            setErrorNotification(e, "requesting authentication challenge");
          } finally {
            setRequestInProgress(false);
          }
          break;
      }
    })();
  };

  return (
    <Card sx={{ margin: "auto", minWidth: 275 }}>
      <CardContent>
        <Grid container direction="column" spacing={2} padding={1}>
          <Grid item>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                fontSize: 96,
              }}
            >
              <QueryStatsIcon fontSize="inherit" />
            </Box>
          </Grid>
          <Grid item>
            <Typography variant="h3" fontSize={24} textAlign="center">
              Rating Tracker
            </Typography>
          </Grid>
          <Grid item>
            <SwitchSelector
              value={action}
              setValue={setAction}
              leftValue="signIn"
              leftLabel="Sign in"
              rightValue="register"
              rightLabel="Register"
            />
          </Grid>
          <Grid container item direction="column">
            <Grid
              item
              maxHeight={action === "register" ? 60 : 0}
              sx={{
                opacity: action === "register" ? 1 : 0,
                transitionProperty: "max-height,opacity",
                transitionDuration: ".4s,.2s",
                transitionDelay: action === "register" && "0s,.2s",
                transitionTimingFunction: `ease`,
              }}
            >
              <TextField
                sx={{ mb: 1 }}
                fullWidth
                id="inputEmail"
                type="email"
                label="Email Address"
                value={email}
                error={emailError}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setEmail(event.target.value);
                  setEmailError(false);
                }}
                required
              />
            </Grid>
            <Grid
              item
              maxHeight={action === "register" ? 60 : 0}
              sx={{
                opacity: action === "register" ? 1 : 0,
                transitionProperty: "max-height,opacity",
                transitionDuration: ".4s,.2s",
                transitionDelay: action === "register" && "0s,.2s",
                transitionTimingFunction: `ease`,
              }}
            >
              <TextField
                sx={{ mb: 1 }}
                fullWidth
                id="inputName"
                label="Name"
                value={name}
                error={nameError}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setName(event.target.value);
                  setNameError(false);
                }}
                required
              />
            </Grid>
            <Grid item>
              <LoadingButton
                loading={requestInProgress}
                startIcon={<FingerprintIcon />}
                variant="contained"
                disabled={action === "register" && (emailError || nameError)}
                fullWidth
                onMouseOver={validate} // Validate input fields on hover
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
