import { delay } from './mockUtils';
import { mockStockBalances, mockStockTransactions } from '../mocks/stock';

export interface StockTransaction {
    _id: string;
    type: 'IN' | 'OUT';
    itemId: {
        _id: string;
        name: string;
        unit: string;
    };
    date: string;
    quantity: number;
    unitPrice: number | null;
    totalPrice: number | null;
    supplier: string | null;
    note: string | null;
    createdAt: string;
}

export interface ItemBalance {
    itemId: string;
    itemName: string;
    unit: string;
    balance: number;
    minStock: number | null;
    belowMinStock: boolean;
}

export interface CreateStockInRequest {
    itemId: string;
    date: string;
    quantity: number;
    unitPrice?: number;
    supplier?: string;
    note?: string;
    // Mock helper
    itemDetails?: { name: string; unit: string };
}

export interface CreateStockOutRequest {
    itemId: string;
    date: string;
    quantity: number;
    note?: string;
    // Mock helper
    itemDetails?: { name: string; unit: string };
}

export interface StockQuery {
    page?: number;
    limit?: number;
    type?: 'IN' | 'OUT';
    itemId?: string;
    from?: string;
    to?: string;
}

let transactions = [...mockStockTransactions];
let balances = [...mockStockBalances];

export const stockApi = {
    getAll: async (query: StockQuery = {}) => {
        await delay(500);
        let filtered = [...transactions];

        if (query.type) filtered = filtered.filter(t => t.type === query.type);
        if (query.itemId) filtered = filtered.filter(t => t.itemId._id === query.itemId);

        // Sorting
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const start = (page - 1) * limit;
        const end = start + limit;

        return {
            success: true,
            data: filtered.slice(start, end),
            total: filtered.length,
            page,
            limit,
            totalPages: Math.ceil(filtered.length / limit)
        };
    },

    getBalances: async (): Promise<{ success: boolean; data: ItemBalance[] }> => {
        await delay(300);
        return { success: true, data: balances };
    },

    createIn: async (data: CreateStockInRequest): Promise<{ success: boolean; data: StockTransaction }> => {
        await delay(400);
        // Find item to update balance
        const balanceIdx = balances.findIndex(b => b.itemId === data.itemId);
        const itemName = balanceIdx >= 0 ? balances[balanceIdx].itemName : 'Unknown';
        const itemUnit = balanceIdx >= 0 ? balances[balanceIdx].unit : 'unit';

        const newTx: StockTransaction = {
            _id: Math.random().toString(36).substr(2, 9),
            type: 'IN',
            itemId: { _id: data.itemId, name: itemName, unit: itemUnit },
            date: data.date,
            quantity: data.quantity,
            unitPrice: data.unitPrice || 0,
            totalPrice: (data.unitPrice || 0) * data.quantity,
            supplier: data.supplier || null,
            note: data.note || null,
            createdAt: new Date().toISOString()
        };
        transactions.unshift(newTx);

        if (balanceIdx >= 0) {
            balances[balanceIdx].balance += data.quantity;
        }

        return { success: true, data: newTx };
    },

    createOut: async (data: CreateStockOutRequest): Promise<{ success: boolean; data: StockTransaction }> => {
        await delay(400);
        const balanceIdx = balances.findIndex(b => b.itemId === data.itemId);
        const itemName = balanceIdx >= 0 ? balances[balanceIdx].itemName : 'Unknown';
        const itemUnit = balanceIdx >= 0 ? balances[balanceIdx].unit : 'unit';

        const newTx: StockTransaction = {
            _id: Math.random().toString(36).substr(2, 9),
            type: 'OUT',
            itemId: { _id: data.itemId, name: itemName, unit: itemUnit },
            date: data.date,
            quantity: data.quantity,
            unitPrice: null,
            totalPrice: null,
            supplier: null,
            note: data.note || null,
            createdAt: new Date().toISOString()
        };
        transactions.unshift(newTx);

        if (balanceIdx >= 0) {
            balances[balanceIdx].balance -= data.quantity;
        }
        return { success: true, data: newTx };
    },

    delete: async (id: string): Promise<void> => {
        await delay(300);
        transactions = transactions.filter(t => t._id !== id);
    },
};

export default stockApi;
