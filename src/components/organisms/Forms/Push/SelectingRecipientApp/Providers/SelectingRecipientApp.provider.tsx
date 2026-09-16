import { ReactNode, useCallback, useMemo, useState } from "react";

import { SelectingRecipientAppContext } from "../Contexts/SelectingRecipientAppContext";
import type { RecipientsMode, SelectedApp, SelectedAppIcon } from "../types/types";

export default function SelectingRecipientAppProvider({ children }: { children: ReactNode }) {
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