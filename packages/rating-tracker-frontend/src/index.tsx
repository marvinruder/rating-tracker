import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import App from "./App";
import { SidebarProvider } from "./contexts/SidebarContext";
import axios from "axios";

/**
 * Encode spaces as %20 instead of +, since + is not a character considered safe by the backend.
 */
axios.defaults.paramsSerializer = {
  encode: (value, defaultEncoder) => {
    const encodedValue = defaultEncoder(value);
    return typeof encodedValue === "string" ? encodedValue.replaceAll("+", "%20") : encodedValue;
  },
};

createRoot(document.getElementById("root")).render(
  <SidebarProvider>
    <HashRouter>
      <App />
    </HashRouter>
  </SidebarProvider>
);
