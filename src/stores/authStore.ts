import { create } from 'zustand';

interface User {
    id: string;
    email: string;
}

interface AuthState {
    accessToken: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAccessToken: (token: string) => void;
    setUser: (user: User | null) => void;
    login: (token: string, user: User) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setAccessToken: (token: string) => {
        set({ accessToken: token });
    },

    setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
    },

    login: (token: string, user: User) => {
        set({
            accessToken: token,
            user,
            isAuthenticated: true,
            isLoading: false,
        });
    },

    logout: () => {
        set({
            accessToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },

    setLoading: (loading: boolean) => {
        set({ isLoading: loading });
    },
}));

export default useAuthStore;
