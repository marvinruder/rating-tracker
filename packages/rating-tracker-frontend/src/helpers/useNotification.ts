import { useContext } from "react";
import NotificationContext, {
  NotificationContextType,
} from "../contexts/NotificationContext";
/**
 * Hook to use the notification context.
 *
 * @returns {NotificationContextType} The notification context.
 */
const useNotification = (): NotificationContextType =>
  useContext(NotificationContext);

export default useNotification;
