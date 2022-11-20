import { useRoutes } from "react-router-dom";
import router from "./router";

import { CssBaseline } from "@mui/material";
import ThemeProvider from "./theme/ThemeProvider";
import ParticleBackground from "./components/ParticleBackground";
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  const content = useRoutes(router);

  return (
    <ThemeProvider>
      <CssBaseline />
      <NotificationProvider>{content}</NotificationProvider>
      <ParticleBackground />
    </ThemeProvider>
  );
}
export default App;
