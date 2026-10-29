export interface AuthState {
  userId: string;
  login: string;
  accountId: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthCredentials extends AuthState {
  accessToken: string;
}

export interface AuthContextValue {
  authState: AuthState | null;
  isAuthorized: boolean;
  login: (auth: AuthCredentials) => void;
  logout: () => void;
  updateUser: (partial: Partial<AuthState>) => void;
}
