import React, { createContext, useState } from "react";
import { Notification } from "../types/Notification";

/**
 * An object provided by the notification context.
 */
export type NotificationContextType = {
  /**
   * The notification to be displayed.
   */
  notification?: Notification;
  /**
   * A method to set the notification to be displayed.
   */
  setNotification: React.Dispatch<
    React.SetStateAction<Notification | undefined>
  >;
};

/**
 * A context providing a state for a notification to be displayed in various components.
 */
const NotificationContext = createContext<NotificationContextType>(
  {} as NotificationContextType
);

/**
 * A provider for the notification context.
 *
 * @param {NotificationProviderProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const NotificationProvider = (
  props: NotificationProviderProps
): JSX.Element => {
  const [notification, setNotification] = useState<Notification | undefined>(
    undefined
  );

  return (
    <NotificationContext.Provider
      value={{
        notification,
        setNotification,
      }}
    >
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

export default NotificationContext;
