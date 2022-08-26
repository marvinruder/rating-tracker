import { FC, useState, createContext } from "react";
type SidebarContext = {
  sidebarToggle: any;
  toggleSidebar: () => void;
  closeSidebar: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SidebarContext = createContext<SidebarContext>(
  {} as SidebarContext
);

type SidebarProviderProps = {
  children: React.ReactNode;
};

export const SidebarProvider: FC<SidebarProviderProps> = (
  props: SidebarProviderProps
) => {
  const [sidebarToggle, setSidebarToggle] = useState(false);
  const toggleSidebar = () => {
    setSidebarToggle(!sidebarToggle);
  };
  const closeSidebar = () => {
    setSidebarToggle(false);
  };

  return (
    <SidebarContext.Provider
      value={{ sidebarToggle, toggleSidebar, closeSidebar }}
    >
      {props.children}
    </SidebarContext.Provider>
  );
};
