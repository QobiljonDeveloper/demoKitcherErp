import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { utilitiesApi, UtilityQuery, CreateUtilityRequest } from '@/api/utilities';

export const UTILITY_KEYS = {
    all: ['utilities'] as const,
    list: (q: UtilityQuery) => [...UTILITY_KEYS.all, q] as const,
};

export function useUtilities(query: UtilityQuery = {}) {
    return useQuery({
        queryKey: UTILITY_KEYS.list(query),
        queryFn: () => utilitiesApi.getAll(query),
    });
}

export function useCreateUtility() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateUtilityRequest) => utilitiesApi.create(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: UTILITY_KEYS.all });
            qc.invalidateQueries({ queryKey: ['stats'] });
            qc.invalidateQueries({ queryKey: ['cash'] });
        },
    });
}

export function useUpdateUtility() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateUtilityRequest> }) =>
            utilitiesApi.update(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: UTILITY_KEYS.all });
            qc.invalidateQueries({ queryKey: ['stats'] });
            qc.invalidateQueries({ queryKey: ['cash'] });
        },
    });
}

export function useDeleteUtility() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => utilitiesApi.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: UTILITY_KEYS.all });
            qc.invalidateQueries({ queryKey: ['stats'] });
            qc.invalidateQueries({ queryKey: ['cash'] });
        },
    });
}
