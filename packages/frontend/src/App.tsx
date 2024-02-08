import { CssBaseline } from "@mui/material";
import { useRoutes } from "react-router-dom";

import { LogoBackground } from "./components/etc/LogoBackground";
import { NotificationSnackbar } from "./components/etc/NotificationSnackbar";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { StatusProvider } from "./contexts/StatusContext";
import { UserProvider } from "./contexts/UserContext";
import router from "./router";
import ThemeProvider from "./theme/ThemeProvider";

/**
 * The Rating Tracker Application.
 * @returns The component.
 */
const App = (): JSX.Element => {
  /**
   * The routes to the different views.
   */
  const content = useRoutes(router);

  return (
    <ThemeProvider>
      <CssBaseline />
      <StatusProvider>
        <NotificationProvider>
          {/* The user context uses the notification context to set a notification when the login was successful and */}
          {/* to clear the user when a notification indicates that the session is no longer valid */}
          <UserProvider>
            {/* The favorites context uses the user context to refetch or clear the favorites when the user changes */}
            <FavoritesProvider>
              {content}
              <NotificationSnackbar snackbarProps={{ anchorOrigin: { horizontal: "center", vertical: "bottom" } }} />
            </FavoritesProvider>
          </UserProvider>
        </NotificationProvider>
      </StatusProvider>
      <LogoBackground />
    </ThemeProvider>
  );
};

export default App;
