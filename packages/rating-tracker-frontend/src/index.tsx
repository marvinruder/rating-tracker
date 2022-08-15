import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import "nprogress/nprogress.css";
import App from "src/App";
import { SidebarProvider } from "src/contexts/SidebarContext";
import * as serviceWorker from "src/serviceWorker";

ReactDOM.render(
  <SidebarProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </SidebarProvider>,
  document.getElementById("root")
);

serviceWorker.unregister();
