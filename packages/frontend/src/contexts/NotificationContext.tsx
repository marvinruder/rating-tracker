import { UNAUTHORIZED_ERROR_MESSAGE } from "@rating-tracker/commons";
import type { AxiosError } from "axios";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import type { ContextProviderProps } from "../types/ContextProviderProps";
import type { Notification } from "../types/Notification";
export const SESSION_EXPIRED_MESSAGE = "Your session has expired. Please log in again.";

/**
 * An object provided by the notification state context.
 */
type NotificationStateContextType = {
  /**
   * The notification to be displayed.
   */
  notification?: Notification;
};

/**
 * An object provided by the notification updater context.
 */
type NotificationUpdaterContextType = {
  /**
   * A method to set the notification to be displayed.
   */
  setNotification: React.Dispatch<React.SetStateAction<Notification | undefined>>;
  /**
   * A method to set an error notification to be displayed after an API request failed.
   */
  setErrorNotificationOrClearSession: (e: unknown, actionDescription: string) => void;
};

/**
 * A context providing a state for a notification to be displayed in various components.
 */
const NotificationStateContext = createContext<NotificationStateContextType>({} as NotificationStateContextType);

/**
 * A context providing update methods for the notification context.
 */
const NotificationUpdaterContext = createContext<NotificationUpdaterContextType>({} as NotificationUpdaterContextType);

/**
 * A provider for the notification context.
 *
 * @param {ContextProviderProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const NotificationProvider = (props: ContextProviderProps): JSX.Element => {
  const [notification, setNotification] = useState<Notification | undefined>(undefined);

  const setErrorNotificationOrClearSession = useCallback(
    (e: AxiosError<{ message: string }>, actionDescription: string) => {
      setNotification({
        severity: "error",
        title: `Error while ${actionDescription}`,
        message:
          e.response?.status && e.response?.data?.message
            ? e.response?.status === 401 && e.response?.data?.message === UNAUTHORIZED_ERROR_MESSAGE
              ? SESSION_EXPIRED_MESSAGE
              : `Response Status Code ${e.response.status}: ${e.response.data.message}`
            : e.message ?? "No additional information available.",
      });
    },
    [],
  );

  const contextValue = useMemo(() => ({ notification }), [notification]);

  return (
    <NotificationStateContext.Provider value={contextValue}>
      <NotificationUpdaterContext.Provider value={{ setNotification, setErrorNotificationOrClearSession }}>
        {props.children}
      </NotificationUpdaterContext.Provider>
    </NotificationStateContext.Provider>
  );
};

/**
 * Hook to use the notification context’s state.
 *
 * @returns {NotificationStateContextType} The notification context’s state.
 */
export const useNotificationContextState = (): NotificationStateContextType => useContext(NotificationStateContext);

/**
 * Hook to use the notification context’s updater methods.
 *
 * @returns {NotificationUpdaterContextType} The notification context’s updater methods.
 */
export const useNotificationContextUpdater = (): NotificationUpdaterContextType =>
  useContext(NotificationUpdaterContext);
