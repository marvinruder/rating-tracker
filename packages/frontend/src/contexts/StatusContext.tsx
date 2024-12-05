import type { Service } from "@rating-tracker/commons";
import { FetchError, handleResponse, serviceArray } from "@rating-tracker/commons";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import statusClient from "../api/status";
import type { DetailedStatus, SystemStatus } from "../types/Status";

type StatusStateContextType = {
  /**
   * The current system status.
   */
  systemStatus: SystemStatus;
  /**
   * The loading state of the system status.
   */
  systemStatusLoading: boolean;
};

type StatusUpdaterContextType = {
  /**
   * Fetches the current system status.
   */
  refreshSystemStatus: () => void;
};

/**
 * A context providing a state for the current system status.
 */
const StatusStateContext = createContext<StatusStateContextType>({} as StatusStateContextType);

/**
 * A context providing update methods for the status context.
 */
const StatusUpdaterContext = createContext<StatusUpdaterContextType>({} as StatusUpdaterContextType);

/**
 * A provider for the status context.
 * @param props The properties of the component.
 * @returns The component.
 */
export const StatusProvider = (props: React.PropsWithChildren): React.JSX.Element => {
  const [systemStatusLoading, setSystemStatusLoading] = useState(false);

  const UNKNOWN_STATUS: SystemStatus = {
    status: {
      status: "N/A",
      details: "No information available",
    },
    services: serviceArray.reduce<Record<Service, DetailedStatus>>(
      (object, key) => ({
        ...object,
        [key]: {
          status: "N/A",
          details: "No information available",
        },
      }),
      {} as Record<Service, DetailedStatus>,
    ),
  };

  const [systemStatus, setSystemStatus] = useState<SystemStatus>(UNKNOWN_STATUS);

  const getSystemStatusFromResponseData = (data: { services?: Partial<Record<Service, string>> }): SystemStatus => ({
    status: {
      status: "status" in data && data.status === "healthy" ? "success" : "warning",
      details: "status" in data && data.status === "healthy" ? "Operational" : "Degraded Service",
    },
    services: serviceArray.reduce<Record<Service, DetailedStatus>>(
      (object, key) => ({
        ...object,
        [key]: {
          status:
            "services" in data && data.services !== undefined && data.services[key] !== undefined
              ? ["Connected", "Configured"].includes(data.services[key])
                ? "success"
                : "Not configured" === data.services[key]
                  ? "N/A"
                  : "error"
              : "N/A",
          details:
            "services" in data && data.services !== undefined && data.services[key] !== undefined
              ? data.services[key]
              : "No information available",
        },
      }),
      {} as Record<Service, DetailedStatus>,
    ),
  });

  const refreshSystemStatus = (): void => (
    setSystemStatusLoading(true),
    void statusClient.index
      .$get()
      .then(handleResponse)
      .then((res) => setSystemStatus(getSystemStatusFromResponseData(res.data)))
      .catch((e) =>
        e instanceof FetchError &&
        typeof e.response.data === "object" &&
        "status" in e.response.data &&
        "services" in e.response.data
          ? setSystemStatus(getSystemStatusFromResponseData(e.response.data))
          : setSystemStatus({
              ...UNKNOWN_STATUS,
              status: {
                status: "error",
                details: "Unreachable",
              },
            }),
      )
      .finally(() => setSystemStatusLoading(false))
  );

  useEffect(() => {
    refreshSystemStatus();
    const interval = setInterval(refreshSystemStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const contextValue = useMemo(() => ({ systemStatus, systemStatusLoading }), [systemStatus, systemStatusLoading]);

  return (
    <StatusStateContext.Provider value={contextValue}>
      <StatusUpdaterContext.Provider value={{ refreshSystemStatus }}>{props.children}</StatusUpdaterContext.Provider>
    </StatusStateContext.Provider>
  );
};

/**
 * Hook to use the status context’s state.
 * @returns The status context’s state.
 */
export const useStatusContextState = (): StatusStateContextType => useContext(StatusStateContext);

/**
 * Hook to use the status context’s updater.
 * @returns The status context’s updater.
 */
export const useStatusContextUpdater = (): StatusUpdaterContextType => useContext(StatusUpdaterContext);
