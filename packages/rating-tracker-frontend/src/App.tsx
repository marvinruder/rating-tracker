import { useRoutes } from "react-router-dom";
import router from "./router";

import { CssBaseline } from "@mui/material";
import ThemeProvider from "./theme/ThemeProvider";
import ParticleBackground from "./components/ParticleBackground";
import { NotificationProvider } from "./contexts/NotificationContext";
import NotificationSnackbar from "./components/NotificationSnackbar";

function App() {
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
}
export default App;
