import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { RecipientsMode, SelectedApp, SelectedAppIcon, SelectingRecipientAppContextValueTest } from "../types/types";

const SelectingRecipientAppContext = createContext<SelectingRecipientAppContextValueTest | null>(null);

export function useSelectingRecipientAppTest() {
  const ctx = useContext(SelectingRecipientAppContext);
  if (!ctx) {
    throw new Error("useSelectingRecipientAppTest must be used within SelectingRecipientAppProvider");
  }
  return ctx;
}

export default function SelectingRecipientAppProviderTest({ children }: { children: ReactNode }) {
  const [selectedApp, setSelectedAppState] = useState<SelectedApp | null>(null);
  const [recipientsMode, setRecipientsModeState] = useState<RecipientsMode>('all');
  const [appError, setAppError] = useState<string | null>(null);
  const [recipientsError, setRecipientsError] = useState<string | null>(null);

  const setSelectedApp = useCallback((app: SelectedApp | null) => {
    setAppError(null); // выбрали приложение — ошибка больше не актуальна
    setSelectedAppState(app);
  }, []);

  const setRecipientsMode = useCallback((mode: RecipientsMode) => {
    setRecipientsError(null); // сменили режим — тоже сбрасываем
    setRecipientsModeState(mode);
  }, []);

  const setSelectedIcon = useCallback((icon: SelectedAppIcon) => {
    setSelectedAppState((prev) => (prev ? { ...prev, icon } : prev));
  }, []);

  const value = useMemo(
    () => ({
      selectedApp,
      setSelectedApp,
      setSelectedIcon,
      recipientsMode,
      setRecipientsMode,
      appError,
      setAppError,
      recipientsError,
      setRecipientsError,
    }),
    [selectedApp, setSelectedApp, setSelectedIcon, recipientsMode, setRecipientsMode, appError, recipientsError],
  );

  return (
    <SelectingRecipientAppContext.Provider value={value}>
      {children}
    </SelectingRecipientAppContext.Provider>
  );
}