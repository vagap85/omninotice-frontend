import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { User } from "@/api/fetches";

interface SelectedUsersContextType {
  selectedUsers: User[];
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  clearUsers: () => void;
}

const SelectedUsersContext = createContext<SelectedUsersContextType | null>(null);

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

export function useSelectedUsers() {
  const ctx = useContext(SelectedUsersContext);
  if (!ctx) {
    throw new Error("useSelectedUsers must be used within SelectedUsersProvider");
  }
  return ctx;
}