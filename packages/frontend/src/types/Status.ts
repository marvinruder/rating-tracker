import type { AlertColor } from "@mui/material";
import type { Service } from "@rating-tracker/commons";

/**
 * A status displayed by a Status Indicator.
 */
export type Status = AlertColor | "N/A";

export type DetailedStatus = {
  /**
   * The status of the service.
   */
  status: Status;
  /**
   * Detailed information about the status of the service.
   */
  details: string;
};

/**
 * The status of the backend API and the services it depends on.
 */
export type SystemStatus = {
  /**
   * The overall status
   */
  status: DetailedStatus;
  /**
   * The status of the services Rating Tracker depends on.
   */
  services: Record<Service, DetailedStatus>;
};
