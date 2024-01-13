import { UNAUTHORIZED_ERROR_MESSAGE } from "@rating-tracker/commons";
import { AxiosError } from "axios";
import React, { createContext, useContext, useState } from "react";

import { UserContext } from "../contexts/UserContext";
import { Notification } from "../types/Notification";

/**
 * An object provided by the notification context.
 */
type NotificationContextType = {
  /**
   * The notification to be displayed.
   */
  notification?: Notification;
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
const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

/**
 * A provider for the notification context.
 *
 * @param {NotificationProviderProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const NotificationProvider = (props: NotificationProviderProps): JSX.Element => {
  const [notification, setNotification] = useState<Notification | undefined>(undefined);
  const { clearUser } = useContext(UserContext);

  const setErrorNotificationOrClearSession = (e: AxiosError<{ message: string }>, actionDescription: string) => {
    setNotification({
      severity: "error",
      title: `Error while ${actionDescription}`,
      message:
        e.response?.status && e.response?.data?.message
          ? `Response Status Code ${e.response.status}: ${e.response.data.message}`
          : e.message ?? "No additional information available.",
    });
    // If the user is no longer authenticated, clear the user information so that they are redirected to the login page
    e.response?.status === 401 && e.response?.data?.message === UNAUTHORIZED_ERROR_MESSAGE && clearUser();
  };

  return (
    <NotificationContext.Provider value={{ notification, setNotification, setErrorNotificationOrClearSession }}>
      {props.children}
    </NotificationContext.Provider>
  );
};

/**
 * Properties for the notification provider.
 */
type NotificationProviderProps = {
  /**
   * The children to be rendered, which are able to access the notification context.
   */
  children: React.ReactNode;
};

/**
 * Hook to use the notification context.
 *
 * @returns {NotificationContextType} The notification context.
 */
export const useNotification = (): NotificationContextType => useContext(NotificationContext);

export default NotificationContext;
