import { useContext } from "react";

import { SelectingRecipientAppContext } from "../Contexts/SelectingRecipientAppContext";

export function useSelectingRecipientApp() {
  const ctx = useContext(SelectingRecipientAppContext);
  if (!ctx) {
    throw new Error("useSelectingRecipientApp must be used within SelectingRecipientAppProvider");
  }
  return ctx;
}