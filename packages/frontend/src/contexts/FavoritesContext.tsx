import type { Stock } from "@rating-tracker/commons";
import { handleResponse } from "@rating-tracker/commons";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import favoriteClient from "../api/favorite";

import { useUserContextState } from "./UserContext";

/**
 * An object provided by the favorites state context.
 */
type FavoritesStateContextType = {
  /**
   * The tickers of the favorite stocks of the user.
   */
  favorites: Stock["ticker"][];
};

/**
 * An object provided by the favorites updater context.
 */
type FavoritesUpdaterContextType = {
  /**
   * Triggers a refetch of the favorite stocks of the user.
   */
  refetchFavorites: () => void;
};

/**
 * A context providing a state for the favorite stocks of the current user.
 */
const FavoritesStateContext = createContext<FavoritesStateContextType>({} as FavoritesStateContextType);

/**
 * A context providing update methods for the favorites context.
 */
const FavoritesUpdaterContext = createContext<FavoritesUpdaterContextType>({} as FavoritesUpdaterContextType);

/**
 * A provider for the favorites context.
 * @param props The properties of the component.
 * @returns The component.
 */
export const FavoritesProvider = (props: React.PropsWithChildren): JSX.Element => {
  const [favorites, setFavorites] = useState<Stock["ticker"][]>([]);
  const { user } = useUserContextState();

  const fetchFavorites = () => {
    if (user) {
      favoriteClient.index
        .$get()
        .then(handleResponse)
        .then((res) => setFavorites(res.data.stocks.map((stock) => stock.ticker)))
        .catch(() => setFavorites([]));
    } else {
      setFavorites([]);
    }
  };

  useEffect(fetchFavorites, [user]);

  const contextValue = useMemo(() => ({ favorites }), [favorites]);

  return (
    <FavoritesStateContext.Provider value={contextValue}>
      <FavoritesUpdaterContext.Provider value={{ refetchFavorites: fetchFavorites }}>
        {props.children}
      </FavoritesUpdaterContext.Provider>
    </FavoritesStateContext.Provider>
  );
};

/**
 * Hook to use the favorites context’s state.
 * @returns The favorites context’s state.
 */
export const useFavoritesContextState = (): FavoritesStateContextType => useContext(FavoritesStateContext);

/**
 * Hook to use the favorites context’s updater.
 * @returns The favorites context’s updater.
 */
export const useFavoritesContextUpdater = (): FavoritesUpdaterContextType => useContext(FavoritesUpdaterContext);
