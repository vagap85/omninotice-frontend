import { useState, useCallback, type ReactNode } from "react";

import { User } from "@/api/types";

import { SelectedUsersContext } from "../Contexts/SelectedUsersContext";

export function SelectedUsersProvider({ children }: { children: ReactNode }) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const addUser = useCallback((user: User) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u.id === user.id) ? prev : [...prev, user]
    );
  }, []);

  const removeUser = useCallback((userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const clearUsers = useCallback(() => setSelectedUsers([]), []);

  return (
    <SelectedUsersContext.Provider
      value={{ selectedUsers, addUser, removeUser, clearUsers }}
    >
      {children}
    </SelectedUsersContext.Provider>
  );
}