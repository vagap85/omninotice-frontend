export interface AuthState {
  accessToken: string;
  tokenType: string;
  login?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthContextValue {
  authState: AuthState | null;
  isAuthorized: boolean;
  login: (auth: AuthState) => void;
  logout: () => void;
}