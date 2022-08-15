import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import { RouteObject } from "react-router";

import SidebarLayout from "src/layouts/SidebarLayout";

import SuspenseLoader from "src/components/SuspenseLoader";

// eslint-disable-next-line react/display-name
const loader = (Component) => (props) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

// Applications

const Stocklist = loader(lazy(() => import("src/content/modules/stocklist")));

// Status

const Status404 = loader(
  lazy(() => import("src/content/pages/Status/Status404"))
);
const Status500 = loader(
  lazy(() => import("src/content/pages/Status/Status500"))
);

const routes: RouteObject[] = [
  {
    path: "",
    element: <SidebarLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/dashboards/stocklist" replace />,
      },
      {
        path: "overview",
        element: <Navigate to="/" replace />,
      },
      {
        path: "dashboards",
        children: [
          {
            path: "stocklist",
            element: <Stocklist />,
          },
        ],
      },
      {
        path: "status",
        children: [
          {
            path: "",
            element: <Navigate to="404" replace />,
          },
          {
            path: "404",
            element: <Status404 />,
          },
          {
            path: "500",
            element: <Status500 />,
          },
        ],
      },
      {
        path: "*",
        element: <Status404 />,
      },
    ],
  },
];

export default routes;
