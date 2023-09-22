import axios from "axios";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { SidebarProvider } from "./contexts/SidebarContext";

/**
 * The globalThis.regeneratorRuntime = undefined addresses a potentially unsafe-eval problem
 * Source: https://github.com/facebook/regenerator/issues/378#issuecomment-802628326
 */
globalThis.regeneratorRuntime = undefined;

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
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </SidebarProvider>,
);
