import { MonthlyStats } from '../api/stats';

export const mockMonthlyStats: MonthlyStats = {
    month: '2026-02',
    incomeTotal: 15400000,
    expenseTotal: 8600000,
    net: 6800000,
    purchasesTotal: 5400000,
    salaryTotal: 3200000,
    utilitiesTotal: 0, // Filled dynamically in stats API from utilities mock
    dailyBreakdown: Array.from({ length: 28 }, (_, i) => {
        const day = (i + 1).toString().padStart(2, '0');
        const income = Math.floor(Math.random() * 1000000) + 500000;
        const expense = Math.floor(Math.random() * 500000) + 200000;
        return {
            date: `2026-02-${day}`,
            income,
            expense,
            net: income - expense,
            purchases: Math.floor(Math.random() * 300000),
            salaries: i % 15 === 0 ? 3200000 : 0,
            utilities: 0, // Filled dynamically in stats API
        };
    }),
};
