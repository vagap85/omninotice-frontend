import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { SelectedApp, SelectedAppIcon, SelectingRecipientAppContextValue } from "../types/types";

const SelectingRecipientAppContext = createContext<SelectingRecipientAppContextValue | null>(null);

export function useSelectingRecipientApp() {
  const ctx = useContext(SelectingRecipientAppContext);
  if (!ctx) {
    throw new Error("useSelectingRecipientApp must be used within SelectingRecipientAppProvider");
  }
  return ctx;
}

export default function SelectingRecipientAppProvider({ children }: { children: ReactNode }) {
  const [selectedApp, setSelectedApp] = useState<SelectedApp | null>(null);

  const setSelectedIcon = useCallback((icon: SelectedAppIcon) => {
    setSelectedApp((prev) => (prev ? { ...prev, icon } : prev));
  }, []);

  const value = useMemo(
    () => ({ selectedApp, setSelectedApp, setSelectedIcon }),
    [selectedApp, setSelectedIcon],
  );

  return (
    <SelectingRecipientAppContext.Provider value={value}>
      {children}
    </SelectingRecipientAppContext.Provider>
  );
}
