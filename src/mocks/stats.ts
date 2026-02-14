import { MonthlyStats } from '../api/stats';

export const mockMonthlyStats: MonthlyStats = {
    month: '2024-07',
    incomeTotal: 15400000,
    expenseTotal: 8600000,
    net: 6800000,
    purchasesTotal: 5400000,
    salaryTotal: 3200000,
    dailyBreakdown: Array.from({ length: 30 }, (_, i) => ({
        date: `2024-07-${(i + 1).toString().padStart(2, '0')}`,
        income: Math.floor(Math.random() * 1000000) + 500000,
        expense: Math.floor(Math.random() * 500000),
        net: 0, // Calculated dynamically if needed, but simple mock is fine
        purchases: 0,
        salaries: 0,
    })).map(d => ({ ...d, net: d.income - d.expense }))
};
