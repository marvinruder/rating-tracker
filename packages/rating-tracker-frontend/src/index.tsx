import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import "nprogress/nprogress.css";
import App from "src/App";
import { SidebarProvider } from "src/contexts/SidebarContext";
import * as serviceWorker from "src/serviceWorker";

createRoot(document.getElementById("root")).render(
  <SidebarProvider>
    <HashRouter>
      <App />
    </HashRouter>
  </SidebarProvider>
);

serviceWorker.unregister();
