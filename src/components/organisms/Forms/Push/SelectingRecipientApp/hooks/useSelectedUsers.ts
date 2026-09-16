import { useContext } from "react";

import { SelectedUsersContext } from "../Contexts/SelectedUsersContext";

export function useSelectedUsers() {
  const ctx = useContext(SelectedUsersContext);
  if (!ctx) {
    throw new Error(
      "useSelectedUsers must be used within SelectedUsersProvider",
    );
  }
  return ctx;
}
