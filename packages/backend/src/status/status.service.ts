import type { Service } from "@rating-tracker/commons";
import { serviceArray } from "@rating-tracker/commons";

import type DBService from "../db/db.service";
import type SignalService from "../signal/signal.service";

/**
 * This service provides methods to check the status of various services in use by the backend.
 */
class StatusService {
  constructor(
    private dbService: DBService,
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
        this.dbService.isReady(),
        this.signalService.isReadyOrUnused(),
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
