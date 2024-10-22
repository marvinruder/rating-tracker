import type LogobackgroundController from "@rating-tracker/backend/api/logobackground";
import { logoBackgroundAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const logoBackgroundClient = hc<typeof LogobackgroundController.prototype.router>(
  `${basePath}${logoBackgroundAPIPath}`,
);

export default logoBackgroundClient;
