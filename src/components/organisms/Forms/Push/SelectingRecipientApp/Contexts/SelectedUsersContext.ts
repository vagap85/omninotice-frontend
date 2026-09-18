import { createContext } from "react";

import { SelectedUsersContextType } from "../../types/types";

export const SelectedUsersContext = createContext<SelectedUsersContextType | null>(null);