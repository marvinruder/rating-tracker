import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";

import "nprogress/nprogress.css";
import App from "src/App";
import { SidebarProvider } from "src/contexts/SidebarContext";
import * as serviceWorker from "src/serviceWorker";

ReactDOM.render(
  <SidebarProvider>
    <HashRouter>
      <App />
    </HashRouter>
  </SidebarProvider>,
  document.getElementById("root")
);

serviceWorker.unregister();
