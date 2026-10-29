import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

import { AuthContext } from './AuthContext';
import {
  clearAuthCookies,
  readAuthCookies,
  saveAuthCookies
} from './authCookies';
import type { AuthCredentials, AuthState } from './types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState | null>(readAuthCookies);

  const login = useCallback((auth: AuthCredentials) => {
    saveAuthCookies(auth);
    setAuthState({
      userId: auth.userId,
      login: auth.login,
      accountId: auth.accountId,
      firstName: auth.firstName,
      lastName: auth.lastName
    });
  }, []);

  const updateUser = useCallback((partial: Partial<AuthState>) => {
    setAuthState((current) => (current ? { ...current, ...partial } : current));
  }, []);

  const logout = useCallback(() => {
    clearAuthCookies();
    setAuthState(null);
  }, []);

  useEffect(() => {
    localStorage.removeItem('usercenter_auth');
  }, []);

  useEffect(() => {
    const syncAuth = () => setAuthState(readAuthCookies());

    window.addEventListener('focus', syncAuth);
    return () => window.removeEventListener('focus', syncAuth);
  }, []);

  const value = useMemo(
    () => ({
      authState,
      isAuthorized: Boolean(authState),
      login,
      logout,
      updateUser
    }),
    [authState, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
