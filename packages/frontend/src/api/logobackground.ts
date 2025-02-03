import type { LogobackgroundAPI } from "@rating-tracker/backend/api/logobackground";
import { logoBackgroundAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const logoBackgroundClient = hc<LogobackgroundAPI>(`${basePath}${logoBackgroundAPIPath}`);

export default logoBackgroundClient;
