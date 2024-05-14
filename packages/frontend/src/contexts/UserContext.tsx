import { User, accountAPIPath } from "@rating-tracker/commons";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import api from "../utils/api";

import {
  SESSION_EXPIRED_MESSAGE,
  useNotificationContextState,
  useNotificationContextUpdater,
} from "./NotificationContext";

/**
 * An object provided by the user state context.
 */
type UserStateContextType = {
  /**
   * Information regarding the current user.
   */
  user: User;
};

/**
 * An object provided by the user updater context.
 */
type UserUpdaterContextType = {
  /**
   * Deletes the user information from the context.
   */
  clearUser: () => void;
  /**
   * Triggers a refetch of the user information.
   * @param version A version number to append to the avatar URL. This will force the browser to refetch the
   *                         avatar if it has changed.
   * @returns {Promise<void>}
   */
  refetchUser: (version?: number) => Promise<void>;
};

/**
 * A context providing a state for the current user.
 */
const UserStateContext = createContext<UserStateContextType>({} as UserStateContextType);

/**
 * A context providing update methods for the user context.
 */
const UserUpdaterContext = createContext<UserUpdaterContextType>({} as UserUpdaterContextType);

/**
 * A provider for the user context.
 * @param props The properties of the component.
 * @returns The component.
 */
export const UserProvider = (props: React.PropsWithChildren): JSX.Element => {
  const [user, setUser] = useState<User>(undefined);
  const { notification } = useNotificationContextState();
  const { setNotification } = useNotificationContextUpdater();

  const clearUser = useCallback(() => setUser(null), []);

  /**
   * Fetches the user information from the server.
   * @param version A version number to append to the avatar URL. This will force the browser to refetch the avatar if
   *                it has changed.
   * @returns A {@link Promise} that resolves when the user information has been fetched and processed.
   */
  const fetchUser = (version?: number): Promise<void> =>
    // Check if the user is authenticated
    api
      .get(accountAPIPath)
      .then((response) => {
        if (Object.keys(response.data).length) {
          const newUser = new User(response.data);
          if (newUser.avatar) {
            if (version) newUser.avatar += `?v=${version}`;
            // Preload the avatar image
            const avatarImage = new Image();
            avatarImage.src = newUser.avatar;
          }
          // If the user was previously not authenticated, display a welcome message.
          if (user === null)
            setNotification({
              severity: "success",
              title: `Welcome back, ${newUser.name}!`,
              message: "Authentication successful",
            });
          setUser(newUser);
        } else {
          clearUser();
        }
      })
      // If unsuccessful, delete the user information so that the user is redirected to the login page
      .catch(clearUser);

  useEffect(() => void fetchUser(), []);

  useEffect(() => {
    if (notification?.message === SESSION_EXPIRED_MESSAGE) clearUser();
  }, [notification?.message]);

  const contextValue = useMemo(() => ({ user }), [user]);

  return (
    <UserStateContext.Provider value={contextValue}>
      <UserUpdaterContext.Provider value={{ clearUser, refetchUser: fetchUser }}>
        {props.children}
      </UserUpdaterContext.Provider>
    </UserStateContext.Provider>
  );
};

/**
 * Hook to use the user context’s state.
 * @returns The user context’s state.
 */
export const useUserContextState = (): UserStateContextType => useContext(UserStateContext);

/**
 * Hook to use the user context’s updater.
 * @returns The user context’s updater.
 */
export const useUserContextUpdater = (): UserUpdaterContextType => useContext(UserUpdaterContext);
