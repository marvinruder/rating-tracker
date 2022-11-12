import {
  Avatar,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import { useState } from "react";
import * as SimpleWebAuthnBrowser from "@simplewebauthn/browser";
import axios, { AxiosError } from "axios";
import {
  authAPI,
  baseUrl,
  registerEndpoint,
  signInEndpoint,
} from "src/endpoints";
import SwitchSelector from "src/components/SwitchSelector";
import NotificationSnackbar, {
  Notification,
} from "src/components/NotificationSnackbar";
import { useNavigate } from "react-router";

const LoginApp = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [action, setAction] = useState<string>("signIn");
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(false);
  const [nameError, setNameError] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>(undefined);

  const validateEmail = () => {
    return (
      document.getElementById("inputEmail") as HTMLInputElement
    ).reportValidity();
  };

  const validateName = () => {
    return (
      document.getElementById("inputName") as HTMLInputElement
    ).reportValidity();
  };

  const validate = () => {
    if (action === "register") {
      setEmailError(!validateEmail());
      setNameError(!validateName());
    }
  };

  const reportError = (err: AxiosError<any>, task: string) =>
    setNotification({
      severity: "error",
      title: `Error while ${task}`,
      message:
        err.response?.status && err.response?.data?.message
          ? `${err.response.status}: ${err.response.data.message}`
          : err.message ?? "No additional information available.",
    });

  const onButtonClick = async () => {
    switch (action) {
      case "register":
        if (validateEmail() && validateName()) {
          try {
            const res = await axios.get(baseUrl + authAPI + registerEndpoint, {
              params: { email, name },
            });
            const authRes = await SimpleWebAuthnBrowser.startRegistration(
              res.data
            );
            try {
              await axios.post(baseUrl + authAPI + registerEndpoint, authRes, {
                params: { email, name },
                headers: { "Content-Type": "application/json" },
              });
              setNotification({
                severity: "success",
                title: "Welcome!",
                message:
                  "Your registration was successful. Please note that a manual activation of your account may still be necessary before you can access the page.",
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
          const res = await axios.get(baseUrl + authAPI + signInEndpoint);
          const authRes = await SimpleWebAuthnBrowser.startAuthentication(
            res.data
          );
          try {
            await axios.post(
              baseUrl + authAPI + signInEndpoint,
              { ...authRes, challenge: res.data.challenge },
              { headers: { "Content-Type": "application/json" } }
            );
            setNotification({
              severity: "success",
              title: "Welcome back!",
              message: "Authentication successful",
            });
            setTimeout(() => navigate("/"), 1000);
          } catch (err) {
            reportError(err, "processing authorization response");
          }
        } catch (err) {
          reportError(err, "requesting authentication challenge");
        }
        break;
      default:
        break;
    }
  };

  return (
    <>
      <NotificationSnackbar notification={notification} />
      <Card sx={{ margin: "auto", minWidth: 275 }}>
        <CardContent>
          <Grid container direction={"column"} spacing={2} padding={1}>
            <Grid item>
              <Avatar
                sx={{
                  m: "auto",
                  height: 64,
                  width: 64,
                  color: theme.palette.text.primary,
                }}
              >
                <QueryStatsIcon fontSize="large" />
              </Avatar>
            </Grid>
            <Grid item>
              <Typography variant="h3" textAlign={"center"}>
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
            <Grid container item direction={"column"} spacing={1}>
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
                  id={"inputEmail"}
                  type={"email"}
                  fullWidth
                  label={"Email Address"}
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
                  id={"inputName"}
                  label={"Name"}
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
                  onMouseOver={validate}
                  onClick={onButtonClick}
                >
                  {action === "signIn" ? "Sign in" : "Register"}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
};

export default LoginApp;
