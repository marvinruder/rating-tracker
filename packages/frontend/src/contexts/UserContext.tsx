import { User } from "@rating-tracker/commons";
import { createContext } from "react";

/**
 * An object provided by the user context.
 */
type UserContextType = {
  /**
   * Information regarding the current user.
   */
  user: User;
  /**
   * Deletes the user information from the context.
   */
  clearUser: () => void;
  /**
   * Triggers a refetch of the user information.
   */
  refetchUser: () => void;
};

/**
 * A context providing information about the current user.
 */
export const UserContext = createContext<UserContextType>({} as UserContextType);
