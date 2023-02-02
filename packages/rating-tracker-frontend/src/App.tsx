import { useRoutes } from "react-router-dom";
import router from "./router";

import { CssBaseline } from "@mui/material";
import ThemeProvider from "./theme/ThemeProvider";
import ParticleBackground from "./components/ParticleBackground";
import { NotificationProvider } from "./contexts/NotificationContext";
import NotificationSnackbar from "./components/NotificationSnackbar";

/**
 * The globalThis.regeneratorRuntime = undefined addresses a potentially unsafe-eval problem
 * Source: https://github.com/facebook/regenerator/issues/378#issuecomment-802628326
 */
globalThis.regeneratorRuntime = undefined;

/**
 * The Rating Tracker Application.
 *
 * @returns {JSX.Element} The component.
 */
const App = (): JSX.Element => {
  /**
   * The routes to the different views.
   */
  const content = useRoutes(router);

  return (
    <ThemeProvider>
      <CssBaseline />
      <NotificationProvider>
        {content}
        <NotificationSnackbar
          snackbarProps={{
            anchorOrigin: { horizontal: "center", vertical: "bottom" },
          }}
        />
      </NotificationProvider>
      <ParticleBackground />
    </ThemeProvider>
  );
};

export default App;
