import type { Service } from "@rating-tracker/commons";
import { serviceArray } from "@rating-tracker/commons";

import type OIDCService from "../auth/oidc.service";
import type DBService from "../db/db.service";
import type EmailService from "../email/email.service";
import type SignalService from "../signal/signal.service";

/**
 * This service provides methods to check the status of various services in use by the backend.
 */
class StatusService {
  constructor(
    private dbService: DBService,
    private emailService: EmailService,
    private oidcService: OIDCService,
    private signalService: SignalService,
  ) {}

  /**
   * Check the status of the connected services.
   * @returns Whether the services are healthy, and an object with the status of each unhealthy service.
   */
  async get(): Promise<{ healthy: boolean; services: Partial<Record<Service, string>> }> {
    let healthy = true;
    const services: Partial<Record<Service, string>> = {};
    (
      await Promise.allSettled([
        // The order is important here and must match the order in `serviceArray`.
        this.dbService.getStatus(),
        this.oidcService.getStatus(),
        this.emailService.getStatus(),
        this.signalService.getStatus(),
      ])
    ).forEach((result, index) => {
      if (result.status === "rejected") {
        healthy = false;
        services[serviceArray[index]] = result.reason.message;
      } else if (result.value) services[serviceArray[index]] = result.value;
    });
    return { healthy, services };
  }
}

export default StatusService;
