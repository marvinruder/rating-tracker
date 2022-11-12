export const baseUrl =
  document.location.protocol +
  "//" +
  document.location.hostname +
  (import.meta.env.VITE_APP_API_PORT != undefined
    ? ":" + import.meta.env.VITE_APP_API_PORT
    : "");

export const sessionAPI = "/api/session";
export const authAPI = "/api/auth";
export const registerEndpoint = "/register";
export const signInEndpoint = "/signIn";
export const stockAPI = "/api/stock";
export const stockListEndpoint = "/list";
