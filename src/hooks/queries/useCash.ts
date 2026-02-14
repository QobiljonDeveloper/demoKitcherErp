import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cashApi, CashQuery, CreateCashRequest } from '@/api/cash';

export const CASH_KEYS = {
    all: ['cash'] as const,
    transactions: (q: CashQuery) => [...CASH_KEYS.all, q.type, q.category, q.limit, q.page, q.from, q.to] as const,
};

export function useCashTransactions(query: CashQuery = {}) {
    return useQuery({
        queryKey: CASH_KEYS.transactions(query),
        queryFn: () => cashApi.getAll(query),
    });
}

export function useCreateCashTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cashApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CASH_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function useUpdateCashTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateCashRequest> }) =>
            cashApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CASH_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function useDeleteCashTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cashApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CASH_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}
