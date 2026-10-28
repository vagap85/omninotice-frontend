import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

import { AuthContext } from './AuthContext';
import type { AuthState } from './types';

const AUTH_STORAGE_KEY = 'usercenter_auth';

const readStoredAuth = (): AuthState | null => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthState;
    if (!parsed?.accessToken || !parsed?.tokenType) return null;
    return parsed;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState | null>(() =>
    readStoredAuth()
  );

  const login = useCallback((auth: AuthState) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    setAuthState(auth);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState(null);
  }, []);

  const updateUser = useCallback((partial: Partial<AuthState>) => {
    setAuthState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Синхронизация между вкладками: срабатывает только в ДРУГИХ вкладках,
  // не в той, где произошло изменение (таково поведение window 'storage' по спецификации) —
  // поэтому login/logout выше обновляют текущую вкладку напрямую через setAuthState,
  // а этот обработчик подхватывает изменения, сделанные в соседних вкладках.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_STORAGE_KEY) return;
      setAuthState(readStoredAuth());
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = useMemo(
    () => ({
      authState,
      isAuthorized: Boolean(authState?.accessToken),
      login,
      logout,
      updateUser
    }),
    [authState, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
