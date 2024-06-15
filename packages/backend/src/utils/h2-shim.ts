// Allow the `fetch` API to use HTTP/2
void fetch(undefined).catch(() => {});
global[Symbol.for("undici.globalDispatcher.1")] = new global[Symbol.for("undici.globalDispatcher.1")].constructor({
  allowH2: true,
});
