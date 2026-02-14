import { delay, paginate } from './mockUtils';
import { mockItems } from '../mocks/items';

// Types (kept from original)
export interface Item {
    _id: string;
    name: string;
    itemType: 'INGREDIENT' | 'SUPPLY' | 'CLEANING' | 'PACKAGING' | 'OTHER';
    unitType: 'WEIGHT' | 'VOLUME' | 'COUNT';
    unit: 'kg' | 'g' | 'liter' | 'ml' | 'piece';
    minStock: number | null;
    defaultUnitPrice: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateItemRequest {
    name: string;
    itemType: Item['itemType'];
    unitType: Item['unitType'];
    unit: Item['unit'];
    minStock?: number;
    defaultUnitPrice?: number;
    isActive?: boolean;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ItemsQuery {
    page?: number;
    limit?: number;
    itemType?: Item['itemType'];
    isActive?: boolean;
    search?: string;
}

// In-memory store for the session
let items = [...mockItems];

export const itemsApi = {
    getAll: async (query: ItemsQuery = {}): Promise<PaginatedResponse<Item>> => {
        await delay(500);
        let filtered = items;

        if (query.itemType) {
            filtered = filtered.filter(i => i.itemType === query.itemType);
        }
        if (query.isActive !== undefined) {
            filtered = filtered.filter(i => i.isActive === query.isActive);
        }
        if (query.search) {
            const lowerSearch = query.search.toLowerCase();
            filtered = filtered.filter(i => i.name.toLowerCase().includes(lowerSearch));
        }

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;

        const start = (page - 1) * limit;
        const end = start + limit;
        const pagedItems = filtered.slice(start, end);
        const total = filtered.length;
        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            data: pagedItems,
            total,
            page,
            limit,
            totalPages
        };
    },

    getActive: async (): Promise<{ success: boolean; data: Item[] }> => {
        await delay(300);
        return { success: true, data: items.filter(i => i.isActive) };
    },

    getById: async (id: string): Promise<{ success: boolean; data: Item }> => {
        await delay(200);
        const item = items.find(i => i._id === id);
        if (!item) throw new Error('Item not found');
        return { success: true, data: item };
    },

    create: async (data: CreateItemRequest): Promise<{ success: boolean; data: Item }> => {
        await delay(400);
        const newItem: Item = {
            ...data,
            _id: Math.random().toString(36).substr(2, 9),
            minStock: data.minStock ?? null,
            defaultUnitPrice: data.defaultUnitPrice ?? null,
            isActive: data.isActive ?? true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        items.unshift(newItem);
        return { success: true, data: newItem };
    },

    update: async (id: string, data: Partial<CreateItemRequest>): Promise<{ success: boolean; data: Item }> => {
        await delay(400);
        const index = items.findIndex(i => i._id === id);
        if (index === -1) throw new Error('Item not found');

        items[index] = { ...items[index], ...data };
        return { success: true, data: items[index] };
    },

    delete: async (id: string): Promise<void> => {
        await delay(300);
        items = items.filter(i => i._id !== id);
    },
};

export default itemsApi;
