import { Suspense, lazy, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { RouteObject } from "react-router";

import SidebarLayout from "./layouts/SidebarLayout";

import SuspenseLoader from "./components/SuspenseLoader";
import axios from "axios";
import { baseUrl, sessionAPI } from "./endpoints";

// eslint-disable-next-line react/display-name
const loader = (Component) => (props) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

// Applications

import LoginApp from "./content/applications/Users/login";

// Modules

const Stocklist = loader(lazy(() => import("./content/modules/stocklist")));

import Status404 from "./content/pages/Status/Status404";
import Status500 from "./content/pages/Status/Status500";

const AuthWrapper = ({
  children,
  isLoginPage,
}: {
  children: JSX.Element;
  isLoginPage?: boolean;
}) => {
  const [done, setDone] = useState<boolean>(false);
  const [authed, setAuthed] = useState<boolean>(false);
  useEffect(() => {
    axios
      .head(baseUrl + sessionAPI)
      .then((res) => setAuthed(res.status === 204))
      .catch(() => {})
      .finally(() => setDone(true));
  }, []);

  return done ? (
    authed ? (
      isLoginPage ? (
        <Navigate to="/" replace />
      ) : (
        children
      )
    ) : isLoginPage ? (
      children
    ) : (
      <Navigate to="/login" replace />
    )
  ) : (
    <SuspenseLoader />
  );
};

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
            element: (
              <AuthWrapper>
                <Stocklist />
              </AuthWrapper>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "login",
    element: (
      <AuthWrapper isLoginPage>
        <LoginApp />
      </AuthWrapper>
    ),
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
];

export default routes;
