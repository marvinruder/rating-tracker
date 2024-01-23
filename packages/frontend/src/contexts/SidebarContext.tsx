import type { Service } from "@rating-tracker/commons";
import { serviceArray, statusEndpointPath } from "@rating-tracker/commons";
import { AxiosError } from "axios";
import type { FC } from "react";
import { useState, createContext, useEffect } from "react";

import type { DetailedStatus, SystemStatus } from "../types/Status";
import api from "../utils/api";

/**
 * An object provided by the sidebar context.
 */
type SidebarContextType = {
  /**
   * Whether the sidebar is open or not.
   */
  sidebarToggle: boolean;
  /**
   * Toggles the sidebar.
   */
  toggleSidebar: () => void;
  /**
   * Closes the sidebar.
   */
  closeSidebar: () => void;
  /**
   * The current system status.
   */
  systemStatus: SystemStatus;
  /**
   * The loading state of the system status.
   */
  systemStatusLoading: boolean;
  /**
   * Fetches the current system status.
   */
  refreshSystemStatus: () => void;
};

/**
 * A context providing a state for a sidebar to be displayed as part of the sidebar layout.
 */
const SidebarContext = createContext<SidebarContextType>({} as SidebarContextType);

/**
 * A provider for the sidebar context.
 *
 * @param {SidebarProviderProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const SidebarProvider: FC<SidebarProviderProps> = (props: SidebarProviderProps): JSX.Element => {
  const [sidebarToggle, setSidebarToggle] = useState(false);
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

  const getSystemStatusFromResponseData = (data: object): SystemStatus => ({
    status: {
      status: "status" in data && data.status === "healthy" ? "success" : "warning",
      details: "status" in data && data.status === "healthy" ? "Operational" : "Degraded Service",
    },
    services: serviceArray.reduce<Record<Service, DetailedStatus>>(
      (object, key) => ({
        ...object,
        [key]: {
          status:
            "services" in data
              ? data.services[key] === undefined
                ? "success"
                : (data.services[key] as string).includes("not configured")
                  ? "N/A"
                  : "error"
              : "N/A",
          details:
            "services" in data
              ? data.services[key] === undefined
                ? "Operational"
                : data.services[key]
              : "No information available",
        },
      }),
      {} as Record<Service, DetailedStatus>,
    ),
  });

  const refreshSystemStatus = () => (
    setSystemStatusLoading(true),
    void api
      .get(statusEndpointPath)
      .then(({ data }) => setSystemStatus(getSystemStatusFromResponseData(data)))
      .catch((e) =>
        e instanceof AxiosError && "status" in e.response.data && "services" in e.response.data
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

  useEffect(refreshSystemStatus, []);

  /**
   * Toggles the sidebar.
   */
  const toggleSidebar = () => {
    setSidebarToggle(!sidebarToggle);
  };

  /**
   * Closes the sidebar.
   */
  const closeSidebar = () => {
    setSidebarToggle(false);
  };

  return (
    <SidebarContext.Provider
      value={{ sidebarToggle, toggleSidebar, closeSidebar, systemStatus, systemStatusLoading, refreshSystemStatus }}
    >
      {props.children}
    </SidebarContext.Provider>
  );
};

/**
 * Properties for the sidebar provider.
 */
type SidebarProviderProps = {
  /**
   * The children to be rendered, which are able to access the sidebar context.
   */
  children: React.ReactNode;
};

export default SidebarContext;
