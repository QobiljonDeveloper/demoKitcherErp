import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi, CreateEmployeeRequest } from '@/api/employees';

export const EMPLOYEE_KEYS = {
    all: ['employees'] as const,
    lists: () => [...EMPLOYEE_KEYS.all, 'list'] as const,
    list: (query: any) => [...EMPLOYEE_KEYS.lists(), query] as const,
    active: ['employees', 'active'] as const,
};

export function useEmployees(query: { page?: number; limit?: number; isActive?: boolean; search?: string } = {}) {
    return useQuery({
        queryKey: EMPLOYEE_KEYS.list(query),
        queryFn: () => employeesApi.getAll(query),
    });
}

export function useActiveEmployees() {
    return useQuery({
        queryKey: EMPLOYEE_KEYS.active,
        queryFn: employeesApi.getActive,
    });
}

export function useCreateEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: employeesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function useUpdateEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateEmployeeRequest> }) =>
            employeesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function useDeleteEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: employeesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}
