import type { User } from "@rating-tracker/commons";

declare module "hono" {
  interface ContextVariableMap {
    ip: string;
    user?: User;
  }
}
