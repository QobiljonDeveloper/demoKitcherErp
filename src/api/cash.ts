import { delay } from './mockUtils';
import { mockCashTransactions } from '../mocks/cash';

export interface CashTransaction {
    _id: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    date: string;
    category: string | null;
    note: string | null;
    relatedRef: string | null;
    createdAt: string;
}

export interface CreateCashRequest {
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    date: string;
    category?: string;
    note?: string;
}

export interface CashQuery {
    page?: number;
    limit?: number;
    type?: 'INCOME' | 'EXPENSE';
    category?: string;
    from?: string;
    to?: string;
}

let transactions = [...mockCashTransactions];

export const cashApi = {
    getAll: async (query: CashQuery = {}) => {
        await delay(400);
        let filtered = [...transactions];

        if (query.type) filtered = filtered.filter(t => t.type === query.type);
        if (query.category) filtered = filtered.filter(t => t.category === query.category);

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

    create: async (data: CreateCashRequest): Promise<{ success: boolean; data: CashTransaction }> => {
        await delay(400);
        const newTx: CashTransaction = {
            _id: Math.random().toString(36).substr(2, 9),
            ...data,
            category: data.category || null,
            note: data.note || null,
            relatedRef: null,
            createdAt: new Date().toISOString()
        };
        transactions.unshift(newTx);
        return { success: true, data: newTx };
    },

    update: async (id: string, data: Partial<CreateCashRequest>): Promise<{ success: boolean; data: CashTransaction }> => {
        await delay(400);
        const idx = transactions.findIndex(t => t._id === id);
        if (idx === -1) throw new Error('Not found');
        transactions[idx] = { ...transactions[idx], ...data };
        return { success: true, data: transactions[idx] };
    },

    delete: async (id: string): Promise<void> => {
        await delay(300);
        transactions = transactions.filter(t => t._id !== id);
    },
};

export default cashApi;
