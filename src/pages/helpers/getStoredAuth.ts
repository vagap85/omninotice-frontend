import { AuthState } from "../types/types";

export const getStoredAuth = (AUTH_STORAGE_KEY: string): AuthState => {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw) as AuthState;
        if (!parsed?.accessToken || !parsed?.tokenType) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
};