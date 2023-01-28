import { Suspense, lazy, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { RouteObject } from "react-router";

import SidebarLayout from "./layouts/SidebarLayout";

import SuspenseLoader from "./components/SuspenseLoader";
import axios from "axios";
import { baseUrl, sessionAPI } from "./endpoints";

/**
 * A wrapper for lazy-loaded components that adds a suspense loader. While the component is loading, the suspense
 * loader will display a loading indicator.
 *
 * @param {React.LazyExoticComponent<React.ComponentType<any>>} Component The component to wrap.
 * @returns {JSX.Element} The component.
 */
const loader = (
  Component: React.LazyExoticComponent<React.ComponentType<any>>
) => {
  /**
   * A wrapper for the suspense loader.
   *
   * @param {JSX.IntrinsicAttributes} props The properties to pass to the component.
   * @returns {JSX.Element} The component.
   */
  const SuspenseWrapper = (props: JSX.IntrinsicAttributes) => {
    return (
      <Suspense fallback={<SuspenseLoader />}>
        <Component {...props} />
      </Suspense>
    );
  };

  return SuspenseWrapper;
};

// Applications

/**
 * The login application.
 * Since it is displayed first, we load it right away and do not use a suspense loader.
 */
import LoginApp from "./content/applications/Users/login";

// Modules

/**
 * The stock list module, loaded only when needed.
 *
 * @param {JSX.IntrinsicAttributes} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const Stocklist = loader(lazy(() => import("./content/modules/stocklist")));

/**
 * The stock module, loaded only when needed.
 *
 * @param {JSX.IntrinsicAttributes} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const Stock = loader(lazy(() => import("./content/modules/stock")));

/**
 * The 404 Not Found error page.
 * Since it is a fairly small component, we load it right away and do not use a suspense loader.
 */
import Status404 from "./content/pages/Status/Status404";

/**
 * The 500 Internal Server Error page.
 * Since it is a fairly small component, we load it right away and do not use a suspense loader.
 */
import Status500 from "./content/pages/Status/Status500";

/**
 * A wrapper ensuring that the user is authenticated before displaying the page.
 *
 * @param {AuthWrapperProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const AuthWrapper = (props: AuthWrapperProps): JSX.Element => {
  const [done, setDone] = useState<boolean>(false);
  const [authed, setAuthed] = useState<boolean>(false);
  useEffect(() => {
    // Check if the user is authenticated
    axios
      .head(baseUrl + sessionAPI)
      .then((res) => setAuthed(res.status === 204))
      .catch(() => {})
      .finally(() => setDone(true));
  }, []);

  return done ? (
    // If the request finished, evaluate the result
    authed ? (
      // If the user is authenticated, display the page
      props.isLoginPage ? (
        // If an authenticated user tries to access the login page, redirect them to the stock list
        <Navigate to="/stocklist" replace />
      ) : (
        props.children // If any other page was requested, show it
      )
    ) : // If the user is not authenticated, show them the login page
    props.isLoginPage ? (
      props.children // If the login page was requested, show it
    ) : (
      <Navigate to="/login" replace /> // If any other page was requested, redirect to the login page
    )
  ) : (
    <SuspenseLoader /> // While the request is still running, show a loading indicator
  );
};

/**
 * Properties for the AuthWrapper component.
 */
interface AuthWrapperProps {
  /**
   * The page to display.
   */
  children: JSX.Element;
  /**
   * Whether the requested page is the login page.
   */
  isLoginPage?: boolean;
}

/**
 * The different routes of the application.
 */
const routes: RouteObject[] = [
  {
    // The home page redirects to the login page. If the user is already logged in, they will be redirected to the stock
    // list.
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    // Those pages will be displayed in the sidebar layout
    path: "",
    element: <SidebarLayout />,
    children: [
      {
        path: "stocklist",
        element: (
          <AuthWrapper>
            <Stocklist />
          </AuthWrapper>
        ),
      },
      {
        path: "stock/:ticker",
        element: (
          <AuthWrapper>
            <Stock />
          </AuthWrapper>
        ),
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
    // If no other route matches, display the 404 Not Found error page
    path: "*",
    element: <Status404 />,
  },
];

export default routes;
