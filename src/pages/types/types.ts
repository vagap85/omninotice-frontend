export type AuthState = {
    accessToken: string;
    tokenType: string;
    login?: string;
    firstName?: string;
    lastName?: string;
} | null;