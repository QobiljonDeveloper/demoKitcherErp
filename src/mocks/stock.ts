import { ItemBalance, StockTransaction } from '../api/stock';
import { mockItems } from './items';

// Helper to check if unit needs factor 1000
const isHeavyUnit = (unit: string) => ['kg', 'liter'].includes(unit);

export const mockStockBalances: ItemBalance[] = mockItems.map(item => {
    // Generate realistic balances
    // For kg/liter: between 10kg (10000) and 100kg (100000)
    // For pieces: between 50 and 500
    const rawRandom = Math.floor(Math.random() * 90) + 10; // 10-99
    const balance = isHeavyUnit(item.unit) ? rawRandom * 1000 : rawRandom * 5;

    return {
        itemId: item._id,
        itemName: item.name,
        unit: item.unit,
        balance: balance,
        minStock: item.minStock,
        belowMinStock: false,
    };
}).map(b => ({
    ...b,
    belowMinStock: b.minStock ? b.balance < b.minStock : false
}));

export const mockStockTransactions: StockTransaction[] = [
    {
        _id: 't1',
        type: 'IN',
        itemId: { _id: '1', name: 'Sigir go\'shti (Laq)', unit: 'kg' },
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        quantity: 50000, // 50 kg
        unitPrice: 82, // 82 UZS/g (82,000/kg)
        totalPrice: 4100000,
        supplier: 'Ali aka',
        note: 'Yangi partiya',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
        _id: 't2',
        type: 'OUT',
        itemId: { _id: '2', name: 'Guruch (Lazer)', unit: 'kg' },
        date: new Date(Date.now() - 86400000).toISOString(),
        quantity: 10000, // 10 kg
        unitPrice: null,
        totalPrice: null,
        supplier: null,
        note: 'Osh uchun',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        _id: 't3',
        type: 'IN',
        itemId: { _id: '5', name: 'Paxta yog\'i', unit: 'liter' },
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
        quantity: 100000, // 100 liter
        unitPrice: 13.5, // 13,500/liter
        totalPrice: 1350000,
        supplier: 'Bozor',
        note: '',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    }
];
