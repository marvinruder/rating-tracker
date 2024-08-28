import type LogobackgroundController from "@rating-tracker/backend/api/logobackground";
import { logoBackgroundAPIPath, baseURL } from "@rating-tracker/commons";
import { hc } from "hono/client";

const logoBackgroundClient = hc<typeof LogobackgroundController.prototype.router>(`${baseURL}${logoBackgroundAPIPath}`);

export default logoBackgroundClient;
