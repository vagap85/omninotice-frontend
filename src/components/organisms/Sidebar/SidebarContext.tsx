import { createContext, useContext, type ReactNode } from 'react';

interface SidebarContextValue {
  isCollapsed: boolean;
}

const SidebarContext = createContext<SidebarContextValue>({
  isCollapsed: false
});

export function SidebarProvider({
  children,
  isCollapsed
}: {
  children: ReactNode;
  isCollapsed: boolean;
}) {
  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
