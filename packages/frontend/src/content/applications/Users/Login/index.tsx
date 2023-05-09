import { Box, Button, Card, CardContent, Grid, TextField, Typography } from "@mui/material";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import { useState } from "react";
import * as SimpleWebAuthnBrowser from "@simplewebauthn/browser";
import axios, { AxiosError } from "axios";
import { baseUrl } from "../../../../router";
import SwitchSelector from "../../../../components/SwitchSelector";
import { useNavigate } from "react-router";
import { useNotification } from "../../../../contexts/NotificationContext";
import { registerEndpointPath, signInEndpointPath } from "@rating-tracker/commons";

/**
 * This component renders the login page.
 *
 * @returns {JSX.Element} The component.
 */
const LoginApp = (): JSX.Element => {
  const navigate = useNavigate();
  const [action, setAction] = useState<"signIn" | "register">("signIn");
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(false);
  const [nameError, setNameError] = useState<boolean>(false);
  const { setNotification } = useNotification();

  /**
   * Validates the email input field.
   *
   * @returns {boolean} Whether the email input field contains a valid email address.
   */
  const validateEmail = () => {
    return (document.getElementById("inputEmail") as HTMLInputElement).reportValidity();
  };

  /**
   * Validates the name input field.
   *
   * @returns {boolean} Whether the name input field contains a valid name.
   */
  const validateName = () => {
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
   * Reports an error to the user using a notification snackbar.
   *
   * @param {AxiosError<any>} err The error to report.
   * @param {string} task A description of the task that caused the error.
   * @returns {void}
   */
  const reportError = (err: AxiosError<any>, task: string): void =>
    setNotification({
      severity: "error",
      title: `Error while ${task}`,
      message:
        err.response?.status && err.response?.data?.message
          ? `${err.response.status}: ${err.response.data.message}`
          : err.message ?? "No additional information available.",
    });

  /**
   * Handles the click event of the login / register button.
   */
  const onButtonClick = async () => {
    switch (action) {
      case "register":
        // Validate input fields
        validate();
        if (validateEmail() && validateName()) {
          try {
            // Request registration challenge
            const res = await axios.get(baseUrl + registerEndpointPath, {
              params: { email, name },
            });
            // Ask the browser to perform the WebAuthn registration and store a corresponding credential
            const authRes = await SimpleWebAuthnBrowser.startRegistration(res.data);
            try {
              // Send the registration challenge response to the server
              await axios.post(baseUrl + registerEndpointPath, authRes, {
                params: { email, name },
                headers: { "Content-Type": "application/json" },
              });
              // This is only reached if the registration was successful
              setNotification({
                severity: "success",
                title: "Welcome!",
                message:
                  "Your registration was successful. Please note that a manual activation of your account may still " +
                  "be necessary before you can access the page.",
              });
            } catch (err) {
              reportError(err, "processing registration response");
            }
          } catch (err) {
            reportError(err, "requesting registration challenge");
          }
        }
        break;
      case "signIn":
        try {
          // Request authentication challenge
          const res = await axios.get(baseUrl + signInEndpointPath);
          // Ask the browser to perform the WebAuthn authentication
          const authRes = await SimpleWebAuthnBrowser.startAuthentication(res.data);
          try {
            // Send the authentication challenge response to the server
            await axios.post(
              baseUrl + signInEndpointPath,
              { ...authRes, challenge: res.data.challenge },
              { headers: { "Content-Type": "application/json" } }
            );
            // This is only reached if the authentication was successful
            setNotification({
              severity: "success",
              title: "Welcome back!",
              message: "Authentication successful",
            });
            navigate("/");
          } catch (err) {
            reportError(err, "processing authorization response");
          }
        } catch (err) {
          reportError(err, "requesting authentication challenge");
        }
        break;
    }
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
                fontSize: 80,
              }}
            >
              <QueryStatsIcon fontSize="inherit" />
            </Box>
          </Grid>
          <Grid item>
            <Typography variant="h3" textAlign="center">
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
          <Grid container item direction="column" spacing={1}>
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
                id="inputEmail"
                type="email"
                fullWidth
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
              <Button
                startIcon={<FingerprintIcon />}
                variant="contained"
                disabled={action === "register" && (emailError || nameError)}
                fullWidth
                onMouseOver={validate} // Validate input fields on hover
                onClick={onButtonClick}
              >
                {action === "signIn" ? "Sign in" : "Register"}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default LoginApp;
