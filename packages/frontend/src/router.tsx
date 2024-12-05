import { Box, CircularProgress } from "@mui/material";
import {
  handleResponse,
  portfolioBuilderEndpointSuffix,
  portfoliosAPIPath,
  stocksAPIPath,
  usersAPIPath,
  watchlistsAPIPath,
} from "@rating-tracker/commons";
import { StrictMode, Suspense, lazy, useEffect } from "react";
import type { RouteObject } from "react-router";
import { useLocation } from "react-router";
import { Navigate, useSearchParams } from "react-router-dom";

//
// Applications
//
/**
 * The login application.
 * Since it is displayed first, we load it right away and do not use a suspense loader.
 */
import authClient from "./api/auth";
import { LoginPage } from "./content/pages/Login";
import { useNotificationContextUpdater } from "./contexts/NotificationContext";
import { useUserContextState, useUserContextUpdater } from "./contexts/UserContext";

/**
 * A component that renders a loading indicator.
 * @returns The component.
 */
const SuspenseLoader = (): React.JSX.Element => (
  <Box
    sx={{
      position: "fixed",
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {/* Loading modules typically blocks the main thread, so we need to use disableShrink */}
    <CircularProgress size={64} thickness={3} disableShrink />
  </Box>
);

/**
 * A wrapper for lazy-loaded components that adds a suspense loader. While the component is loading, the suspense
 * loader will display a loading indicator.
 * @param Component The component to wrap.
 * @returns The component.
 */
const loader = (
  Component: React.LazyExoticComponent<React.ComponentType<any>>,
): ((props: React.JSX.IntrinsicAttributes) => React.JSX.Element) => {
  /**
   * A wrapper for the suspense loader.
   * @param props The properties to pass to the component.
   * @returns The component.
   */
  const SuspenseWrapper = (props: React.JSX.IntrinsicAttributes): React.JSX.Element => (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

  return SuspenseWrapper;
};

// Modules

/**
 * The portfolio module, loaded only when needed.
 * @param props The properties of the component.
 * @returns The component.
 */
const Portfolio = loader(lazy(() => import("./content/modules/Portfolio/Portfolio")));

/**
 * The portfolio builder module, loaded only when needed.
 * @param props The properties of the component.
 * @returns The component.
 */
const PortfolioBuilder = loader(lazy(() => import("./content/modules/PortfolioBuilder/PortfolioBuilder")));

/**
 * The portfolio summary module, loaded only when needed.
 * @param props The properties of the component.
 * @returns The component.
 */
const PortfolioSummary = loader(lazy(() => import("./content/modules/PortfolioSummary/PortfolioSummary")));

/**
 * The stock list module, loaded only when needed.
 * @param props The properties of the component.
 * @returns The component.
 */
const StockList = loader(lazy(() => import("./content/modules/StockList/StockList")));

/**
 * The user management module, loaded only when needed.
 * @param props The properties of the component.
 * @returns The component.
 */
const UserManagement = loader(lazy(() => import("./content/modules/UserManagement/UserManagement")));

/**
 * The stock module, loaded only when needed.
 * @param props The properties of the component.
 * @returns The component.
 */
const Stock = loader(lazy(() => import("./content/modules/Stock/Stock")));

/**
 * The watchlist summary module, loaded only when needed.
 * @param props The properties of the component.
 * @returns The component.
 */
const WatchlistSummary = loader(lazy(() => import("./content/modules/WatchlistSummary/WatchlistSummary")));

/**
 * The watchlist module, loaded only when needed.
 * @param props The properties of the component.
 * @returns The component.
 */
const Watchlist = loader(lazy(() => import("./content/modules/Watchlist/Watchlist")));

// Pages

/**
 * The 404 Not Found page, loaded only when needed.
 * @returns The component.
 */
const Status404 = loader(lazy(() => import("./content/pages/Status/Status404")));

// Layouts

/**
 * The sidebar layout, loaded only when needed.
 * @returns The component.
 */
const SidebarLayout = loader(lazy(() => import("./layouts/SidebarLayout/SidebarLayout")));

/**
 * Returns a human-readable ASCII encoded text description of an OAuth2 or OpenID Connect error code. If the error code
 * is unknown, a generic error message is returned.
 * @param errorCode The error code to describe.
 * @returns The description of the error code.
 */
const oidcErrorDescription = (errorCode: string): string => {
  switch (errorCode) {
    case "invalid_request":
      return (
        "The request is missing a required parameter, includes an invalid parameter value, " +
        "includes a parameter more than once, or is otherwise malformed."
      );
    case "unauthorized_client":
      return "Rating Tracker is not authorized to request an authorization code using this method.";
    case "access_denied":
      return "The resource owner or the OpenID Connect provider denied the request.";
    case "unsupported_response_type":
      return "The OpenID Connect provider does not support obtaining an authorization code using this method.";
    case "invalid_scope":
      return "The requested scope is invalid, unknown, or malformed.";
    case "server_error":
      return (
        "The OpenID Connect provider encountered an unexpected condition " +
        "that prevented it from fulfilling the request."
      );
    case "temporarily_unavailable":
      return (
        "The OpenID Connect provider is currently unable to handle the request due to a " +
        "temporary overloading or maintenance."
      );
    case "interaction_required":
      return "The OpenID Connect provider requires user interaction of some form to proceed.";
    case "login_required":
      return "The OpenID Connect provider requires user authentication.";
    case "account_selection_required":
      return "The user is required to select a session at the OpenID Connect provider.";
    case "consent_required":
      return "The OpenID Connect provider requires user consent.";
    default:
      return "An unknown error occurred.";
  }
};

/**
 * A wrapper ensuring that the user is authenticated before displaying the page.
 * Also provides a user context if the user is authenticated.
 * @param props The properties of the component.
 * @returns The component.
 */
const AuthWrapper = (props: AuthWrapperProps): React.JSX.Element => {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUserContextState();
  const { refetchUser } = useUserContextUpdater();
  const { setNotification, setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  const redirectedFromOIDC =
    props.isLoginPage &&
    (searchParams.has("code") ||
      searchParams.has("error") ||
      (searchParams.has("origin") && searchParams.get("origin") === "oidc_post_logout"));

  useEffect(() => {
    if (redirectedFromOIDC)
      void (async (): Promise<void> => {
        if (searchParams.has("code")) {
          try {
            // Send the authentication challenge response to the server
            await authClient.oidc
              .$post({ json: Object.fromEntries(searchParams) as { code: string } })
              .then(handleResponse);
            // This is only reached if the authentication was successful
            setNotification(undefined);
            await refetchUser(); // After refetching, the user is redirected automatically
          } catch (e) {
            setErrorNotificationOrClearSession(e, "completing OpenID Connect authentication");
          }
        } else if (searchParams.has("error")) {
          setErrorNotificationOrClearSession(
            new Error(oidcErrorDescription(searchParams.get("error") ?? "")),
            "authenticating using OpenID Connect",
          );
        } else if (searchParams.has("origin") && searchParams.get("origin") === "oidc_post_logout") {
          setNotification({
            severity: "success",
            title: "See you next time!",
            message: "Signed out successfully from OpenID Connect",
          });
        }
        setSearchParams({});
      })();
  }, []);

  return (
    <StrictMode>
      {user !== undefined && !redirectedFromOIDC ? (
        // If the request finished, evaluate the result
        user ? (
          // If the user is authenticated, display the page
          props.isLoginPage ? (
            // If an authenticated user tries to access the login page, redirect them to their desired page
            // If no redirect was specified, redirect to the stock page
            <Navigate to={searchParams.get("redirect") || stocksAPIPath} replace />
          ) : (
            props.children // If any other page was requested, show it
          )
        ) : // If the user is not authenticated, show them the login page
        props.isLoginPage ? (
          props.children // If the login page was requested, show it
        ) : (
          // If any other page was requested, redirect to the login page while retaining the requested path
          <Navigate to={`/login?redirect=${encodeURIComponent(pathname)}`} replace />
        )
      ) : (
        <SuspenseLoader /> // While the request is still running, show a loading indicator
      )}
    </StrictMode>
  );
};

/**
 * Properties for the AuthWrapper component.
 */
interface AuthWrapperProps {
  /**
   * The page to display.
   */
  children: React.JSX.Element;
  /**
   * Whether the requested page is the login page.
   */
  isLoginPage?: boolean;
}

/**
 * A component that redirects to the current URL, triggering an HTTP request to the API instead of interpreting the
 * API URL as a React route. This can happen if the `redirect` parameter contains a URL that is not a React route, but
 * e.g. a screenshot resource URL.
 * @returns The component.
 */
const ForwardToAPI = (): React.JSX.Element => {
  useEffect(() => {
    document.location = document.location;
  }, []);
  return <></>;
};

/**
 * The different routes of the application.
 */
const routes: RouteObject[] = [
  // The home page redirects to the login page. If the user is already logged in, they will be redirected to the stock
  // list from there.
  { path: "/", element: <Navigate to="/login" replace /> },
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
      { path: `${portfoliosAPIPath}/:id`, element: <Portfolio /> },
      { path: portfoliosAPIPath + portfolioBuilderEndpointSuffix, element: <PortfolioBuilder /> },
      { path: portfoliosAPIPath, element: <PortfolioSummary /> },
      { path: stocksAPIPath, element: <StockList /> },
      { path: `${stocksAPIPath}/:ticker`, element: <Stock /> },
      { path: usersAPIPath, element: <UserManagement /> },
      { path: watchlistsAPIPath, element: <WatchlistSummary /> },
      { path: `${watchlistsAPIPath}/:id`, element: <Watchlist /> },
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
      { path: "", element: <Navigate to="404" replace /> },
      { path: "404", element: <Status404 /> },
    ],
  },
  // API requests are not handled by the router, but by the API client, so we need to trigger an HTTP request
  { path: "api/*", element: <ForwardToAPI /> },
  // If no other route matches, display the 404 Not Found error page
  { path: "*", element: <Status404 /> },
];

export default routes;
