import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockApi, StockQuery, CreateStockInRequest, CreateStockOutRequest } from '@/api/stock';

export const STOCK_KEYS = {
    all: ['stock'] as const,
    transactions: (filters: StockQuery) => [...STOCK_KEYS.all, 'transactions', filters] as const,
    balances: ['stock', 'balances'] as const,
};

export function useStockTransactions(query: StockQuery = {}) {
    return useQuery({
        queryKey: STOCK_KEYS.transactions(query),
        queryFn: () => stockApi.getAll(query),
    });
}

export function useStockBalances() {
    return useQuery({
        queryKey: STOCK_KEYS.balances,
        queryFn: stockApi.getBalances,
    });
}

export function useCreateStockIn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: stockApi.createIn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STOCK_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function useCreateStockOut() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: stockApi.createOut,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STOCK_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function useDeleteStockTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: stockApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STOCK_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}
