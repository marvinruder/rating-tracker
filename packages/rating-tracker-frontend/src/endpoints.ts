export const baseUrl =
  document.location.protocol +
  "//" +
  document.location.hostname +
  (import.meta.env.VITE_APP_API_PORT != undefined
    ? ":" + import.meta.env.VITE_APP_API_PORT
    : "");

export const stockAPI = "/api/stock";
export const stockListEndpoint = "/list";
export const stockDetailsEndpoint = "/details/";
