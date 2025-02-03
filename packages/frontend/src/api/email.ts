import type { EmailAPI } from "@rating-tracker/backend/api/email";
import { emailAPIPath, basePath } from "@rating-tracker/commons";
import { hc } from "hono/client";

const emailClient = hc<EmailAPI>(`${basePath}${emailAPIPath}`);

export default emailClient;
