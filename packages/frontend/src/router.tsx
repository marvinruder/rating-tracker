import { User, userEndpointPath } from "@rating-tracker/commons";
import { Suspense, lazy, useState, useEffect, createContext } from "react";
import type { RouteObject } from "react-router";
import { useLocation } from "react-router";
import { Navigate, useSearchParams } from "react-router-dom";

import { NotificationSnackbar } from "./components/etc/NotificationSnackbar";
import { SuspenseLoader } from "./components/etc/SuspenseLoader";
//
// Applications
//
/**
 * The login application.
 * Since it is displayed first, we load it right away and do not use a suspense loader.
 */
import LoginPage from "./content/pages";
/**
 * The 404 Not Found and 500 Internal Server Error error pages.
 * Since those are fairly small components, we load them right away and do not use a suspense loader.
 */
import { Status404, Status500 } from "./content/pages/Status";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SidebarLayout } from "./layouts";
import api from "./utils/api";

/**
 * A wrapper for lazy-loaded components that adds a suspense loader. While the component is loading, the suspense
 * loader will display a loading indicator.
 *
 * @param {React.LazyExoticComponent<React.ComponentType<any>>} Component The component to wrap.
 * @returns {JSX.Element} The component.
 */
const loader = (
  Component: React.LazyExoticComponent<React.ComponentType<any>>,
): ((props: JSX.IntrinsicAttributes) => JSX.Element) => {
  /**
   * A wrapper for the suspense loader.
   *
   * @param {JSX.IntrinsicAttributes} props The properties to pass to the component.
   * @returns {JSX.Element} The component.
   */
  const SuspenseWrapper = (props: JSX.IntrinsicAttributes): JSX.Element => {
    return (
      <Suspense fallback={<SuspenseLoader />}>
        <Component {...props} />
      </Suspense>
    );
  };

  return SuspenseWrapper;
};

// Modules

/**
 * The stock list module, loaded only when needed.
 *
 * @param {JSX.IntrinsicAttributes} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const StockList = loader(lazy(() => import("./content/modules/StockList/StockList")));

/**
 * The user management module, loaded only when needed.
 *
 * @param {JSX.IntrinsicAttributes} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const UserManagement = loader(lazy(() => import("./content/modules/UserManagement/UserManagement")));

/**
 * The stock module, loaded only when needed.
 *
 * @param {JSX.IntrinsicAttributes} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const Stock = loader(lazy(() => import("./content/modules/Stock/Stock")));

/**
 * The watchlist summary module, loaded only when needed.
 *
 * @param {JSX.IntrinsicAttributes} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const WatchlistSummary = loader(lazy(() => import("./content/modules/WatchlistSummary/WatchlistSummary")));

/**
 * The watchlist module, loaded only when needed.
 *
 * @param {JSX.IntrinsicAttributes} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const Watchlist = loader(lazy(() => import("./content/modules/Watchlist/Watchlist")));

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
 *
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
    api
      .get(userEndpointPath)
      .then((response) => {
        setUser(new User(response.data));
      })
      // If unsuccessful, delete the user information so that the user is redirected to the login page
      .catch(clearUser)
      .finally(() => setDone(true));
  }, [userToggle]);

  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  /**
   * The requested page, wrapped in a user and notification context.
   *
   * @returns {JSX.Element} The component.
   */
  const Page = (): JSX.Element => (
    <UserContext.Provider value={{ user, clearUser, refetchUser }}>
      <NotificationProvider>
        {props.children}
        <NotificationSnackbar snackbarProps={{ anchorOrigin: { horizontal: "center", vertical: "bottom" } }} />
      </NotificationProvider>
    </UserContext.Provider>
  );
  return done ? (
    // If the request finished, evaluate the result
    user ? (
      // If the user is authenticated, display the page
      props.isLoginPage ? (
        // If an authenticated user tries to access the login page, redirect them to their desired page
        // If no redirect was specified, redirect to the stock page
        <Navigate to={searchParams.get("redirect") || "/stock"} replace />
      ) : (
        <Page /> // If any other page was requested, show it
      )
    ) : // If the user is not authenticated, show them the login page
    props.isLoginPage ? (
      <Page /> // If the login page was requested, show it
    ) : (
      // If any other page was requested, redirect to the login page while retaining the requested path
      <Navigate to={`/login?redirect=${encodeURIComponent(pathname)}`} replace />
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
 * A component that redirects to the current URL, triggering an HTTP request to the API instead of interpreting the
 * API URL as a React route. This can happen if the `redirect` parameter contains a URL that is not a React route, but
 * e.g. a screenshot resource URL.
 *
 * @returns {JSX.Element} The component.
 */
const ForwardToAPI = (): JSX.Element => {
  document.location = document.location;
  return <></>;
};

/**
 * The different routes of the application.
 */
const routes: RouteObject[] = [
  {
    // The home page redirects to the login page. If the user is already logged in, they will be redirected to the stock
    // list from there.
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
        path: "stock",
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
      {
        path: "watchlist",
        element: <WatchlistSummary />,
      },
      {
        path: "watchlist/:id",
        element: <Watchlist />,
      },
    ],
  },
  {
    path: "login",
    element: (
      <AuthWrapper isLoginPage>
        <LoginPage />
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
    // API requests are not handled by the router, but by the API client, so we need to trigger an HTTP request
    path: "api/*",
    element: <ForwardToAPI />,
  },
  {
    // If no other route matches, display the 404 Not Found error page
    path: "*",
    element: <Status404 />,
  },
];

export default routes;
