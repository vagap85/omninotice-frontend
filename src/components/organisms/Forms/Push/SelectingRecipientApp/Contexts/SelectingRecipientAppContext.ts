import { createContext } from "react";

import { SelectingRecipientAppContextValue } from "../types/types";

export const SelectingRecipientAppContext = createContext<SelectingRecipientAppContextValue | null>(null);