import { CashTransaction } from '../api/cash';

export const mockCashTransactions: CashTransaction[] = [
    {
        _id: 'c1',
        type: 'INCOME',
        amount: 5000000,
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        category: 'Savdo',
        note: 'Tushlikdan tushum',
        relatedRef: null,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
        _id: 'c2',
        type: 'EXPENSE',
        amount: 200000,
        date: new Date(Date.now() - 86400000 * 4).toISOString(),
        category: 'Xarajat',
        note: 'Taksi puli',
        relatedRef: null,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
        _id: 'c3',
        type: 'EXPENSE',
        amount: 4100000,
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        category: 'Mahsulot',
        note: 'Go\'sht uchun to\'lov',
        relatedRef: 't1',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    }
];
