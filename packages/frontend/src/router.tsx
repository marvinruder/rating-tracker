import { Box, CircularProgress } from "@mui/material";
import {
  portfolioBuilderEndpointSuffix,
  portfoliosEndpointPath,
  stocksEndpointPath,
  usersEndpointPath,
  watchlistsEndpointPath,
} from "@rating-tracker/commons";
import { Suspense, lazy } from "react";
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
import { LoginPage } from "./content/pages/Login";
import { useUserContextState } from "./contexts/UserContext";

/**
 * A component that renders a loading indicator.
 * @returns The component.
 */
const SuspenseLoader = (): JSX.Element => (
  <Box
    position="fixed"
    left={0}
    top={0}
    width="100%"
    height="100%"
    display="flex"
    alignItems="center"
    justifyContent="center"
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
): ((props: JSX.IntrinsicAttributes) => JSX.Element) => {
  /**
   * A wrapper for the suspense loader.
   * @param props The properties to pass to the component.
   * @returns The component.
   */
  const SuspenseWrapper = (props: JSX.IntrinsicAttributes): JSX.Element => (
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
 * A wrapper ensuring that the user is authenticated before displaying the page.
 * Also provides a user context if the user is authenticated.
 * @param props The properties of the component.
 * @returns The component.
 */
const AuthWrapper = (props: AuthWrapperProps): JSX.Element => {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useUserContextState();

  return user !== undefined ? (
    // If the request finished, evaluate the result
    user ? (
      // If the user is authenticated, display the page
      props.isLoginPage ? (
        // If an authenticated user tries to access the login page, redirect them to their desired page
        // If no redirect was specified, redirect to the stock page
        <Navigate to={searchParams.get("redirect") || stocksEndpointPath} replace />
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
 * @returns The component.
 */
const ForwardToAPI = (): JSX.Element => {
  document.location = document.location;
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
      { path: portfoliosEndpointPath + "/:id", element: <Portfolio /> },
      { path: portfoliosEndpointPath + portfolioBuilderEndpointSuffix, element: <PortfolioBuilder /> },
      { path: portfoliosEndpointPath, element: <PortfolioSummary /> },
      { path: stocksEndpointPath, element: <StockList /> },
      { path: stocksEndpointPath + "/:ticker", element: <Stock /> },
      { path: usersEndpointPath, element: <UserManagement /> },
      { path: watchlistsEndpointPath, element: <WatchlistSummary /> },
      { path: watchlistsEndpointPath + "/:id", element: <Watchlist /> },
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
