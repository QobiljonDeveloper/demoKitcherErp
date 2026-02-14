import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salariesApi, CreateSalaryRequest } from '@/api/employees';

export const SALARY_KEYS = {
    all: ['salaries'] as const,
    lists: () => [...SALARY_KEYS.all, 'list'] as const,
    list: (query: any) => [...SALARY_KEYS.lists(), query] as const,
    stats: (month: string) => [...SALARY_KEYS.all, 'stats', month] as const,
};

export function useSalaries(query: { page?: number; limit?: number; month?: string; employeeId?: string } = {}) {
    return useQuery({
        queryKey: SALARY_KEYS.list(query),
        queryFn: () => salariesApi.getAll(query),
    });
}

export function useSalaryStats(month: string) {
    return useQuery({
        queryKey: SALARY_KEYS.stats(month),
        queryFn: () => salariesApi.getMonthlyStats(month),
        enabled: !!month,
    });
}

export function useCreateSalary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: salariesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SALARY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function useUpdateSalary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateSalaryRequest> }) =>
            salariesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SALARY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function useDeleteSalary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: salariesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SALARY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}
