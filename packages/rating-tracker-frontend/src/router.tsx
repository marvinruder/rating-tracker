import { Suspense, lazy, useState, useEffect, createContext } from "react";
import { Navigate } from "react-router-dom";
import { RouteObject } from "react-router";

import SidebarLayout from "./layouts/SidebarLayout";

import SuspenseLoader from "./components/SuspenseLoader";
import axios from "axios";

/**
 * The base URL of the backend API server.
 */
export const baseUrl = `${document.location.protocol}//${document.location.hostname}/api`;

/**
 * A wrapper for lazy-loaded components that adds a suspense loader. While the component is loading, the suspense
 * loader will display a loading indicator.
 * @param {React.LazyExoticComponent<React.ComponentType<any>>} Component The component to wrap.
 * @returns {JSX.Element} The component.
 */
const loader = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => {
  /**
   * A wrapper for the suspense loader.
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
 * @param {JSX.IntrinsicAttributes} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const StockList = loader(lazy(() => import("./content/modules/stocklist")));

/**
 * The user management module, loaded only when needed.
 * @param {JSX.IntrinsicAttributes} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const UserManagement = loader(lazy(() => import("./content/modules/UserManagement")));

/**
 * The stock module, loaded only when needed.
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
import { User, userEndpointPath } from "rating-tracker-commons";

/**
 * An object provided by the user context.
 */
type UserContextType = {
  /**
   * Information regarding the current user.
   */
  user: User;
  /**
   * Deletes the user information from the context.
   */
  clearUser: () => void;
  /**
   * Triggers a refetch of the user information.
   */
  refetchUser: () => void;
};

/**
 * A context providing information about the current user.
 */
export const UserContext = createContext<UserContextType>({} as UserContextType);

/**
 * A wrapper ensuring that the user is authenticated before displaying the page.
 * Also provides a user context if the user is authenticated.
 * @param {AuthWrapperProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const AuthWrapper = (props: AuthWrapperProps): JSX.Element => {
  const [done, setDone] = useState<boolean>(false);
  const [user, setUser] = useState<User>(undefined);
  const [userToggle, setUserToggle] = useState(false);

  /**
   * Deletes the user information from the context.
   */
  const clearUser = () => {
    setUser(undefined);
  };

  /**
   * Triggers a refetch of the user information.
   */
  const refetchUser = () => {
    setUserToggle(!userToggle);
  };

  useEffect(() => {
    // Check if the user is authenticated
    axios
      .get(baseUrl + userEndpointPath)
      .then((response) => {
        setUser(new User(response.data));
      })
      .catch(() => {})
      .finally(() => setDone(true));
  }, [userToggle]);

  return done ? (
    // If the request finished, evaluate the result
    user ? (
      // If the user is authenticated, display the page
      props.isLoginPage ? (
        // If an authenticated user tries to access the login page, redirect them to the stock list
        <Navigate to="/stocklist" replace />
      ) : (
        // If any other page was requested, show it and provide the user context
        <UserContext.Provider value={{ user, clearUser, refetchUser }}>{props.children}</UserContext.Provider>
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
    element: (
      // Wrap the sidebar layout in the authentication wrapper which provides the user context, so that we can show the
      // user information in the header.
      <AuthWrapper>
        <SidebarLayout />
      </AuthWrapper>
    ),
    children: [
      {
        path: "stocklist",
        element: <StockList />,
      },
      {
        path: "stock/:ticker",
        element: <Stock />,
      },
      {
        path: "usermanagement",
        element: <UserManagement />,
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
