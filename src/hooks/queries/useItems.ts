import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi, ItemsQuery, CreateItemRequest } from '@/api/items';

export const ITEM_KEYS = {
    all: ['items'] as const,
    lists: () => [...ITEM_KEYS.all, 'list'] as const,
    list: (filters: ItemsQuery) => [...ITEM_KEYS.lists(), filters] as const,
    active: () => [...ITEM_KEYS.all, 'active'] as const,
    details: () => [...ITEM_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...ITEM_KEYS.details(), id] as const,
};

export function useItems(query: ItemsQuery = {}) {
    return useQuery({
        queryKey: ITEM_KEYS.list(query),
        queryFn: () => itemsApi.getAll(query),
    });
}

export function useActiveItems() {
    return useQuery({
        queryKey: ITEM_KEYS.active(),
        queryFn: itemsApi.getActive,
    });
}

export function useItem(id: string) {
    return useQuery({
        queryKey: ITEM_KEYS.detail(id),
        queryFn: () => itemsApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: itemsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ITEM_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function useUpdateItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateItemRequest> }) =>
            itemsApi.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ITEM_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ITEM_KEYS.detail(data.data._id) });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function useDeleteItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: itemsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ITEM_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}
