import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, LoginRequest } from '@/api/auth';

export const AUTH_KEYS = {
    user: ['auth', 'user'] as const,
};

export function useLogin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            // Usually we store token in localStorage here or in context
            localStorage.setItem('accessToken', data.data.accessToken);
            queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            localStorage.removeItem('accessToken');
            queryClient.setQueryData(AUTH_KEYS.user, null);
            queryClient.clear();
        },
    });
}

export function useUser() {
    return useQuery({
        queryKey: AUTH_KEYS.user,
        queryFn: authApi.getMe,
        retry: false,
    });
}
