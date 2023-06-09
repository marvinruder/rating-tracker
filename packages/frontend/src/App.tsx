import { useRoutes } from "react-router-dom";
import router from "./router";

import { CssBaseline } from "@mui/material";
import ThemeProvider from "./theme/ThemeProvider";
import { NotificationSnackbar } from "./components/etc/NotificationSnackbar";
import { ParticleBackground } from "./components/etc/ParticleBackground";
import { NotificationProvider } from "./contexts/NotificationContext";

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
        <NotificationSnackbar snackbarProps={{ anchorOrigin: { horizontal: "center", vertical: "bottom" } }} />
      </NotificationProvider>
      <ParticleBackground />
    </ThemeProvider>
  );
};

export default App;
