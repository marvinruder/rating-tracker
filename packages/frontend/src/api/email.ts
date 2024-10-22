import type EmailController from "@rating-tracker/backend/api/email";
import { emailAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const emailClient = hc<typeof EmailController.prototype.router>(`${basePath}${emailAPIPath}`);

export default emailClient;
