import { createContext, useState } from "react";
import { Notification } from "../types";

const NotificationContext = createContext<{
  notification?: Notification;
  setNotification: (notification: Notification) => void;
}>({
  notification: undefined,
  setNotification: () => undefined,
});

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
