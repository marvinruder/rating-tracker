import { FC, useState, createContext } from "react";

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
export const SidebarProvider: FC<SidebarProviderProps> = (props: SidebarProviderProps) => {
  const [sidebarToggle, setSidebarToggle] = useState(false);

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
    <SidebarContext.Provider value={{ sidebarToggle, toggleSidebar, closeSidebar }}>
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
