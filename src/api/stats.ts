import { delay } from './mockUtils';
import { mockMonthlyStats } from '../mocks/stats';
import { mockStockBalances } from '../mocks/stock';
import { mockUtilities } from '../mocks/utilities';

export interface DailyStats {
    date: string;
    incomeTotal: number;
    expenseTotal: number;
    net: number;
    purchasesTotal: number;
    salaryTotal: number;
    utilitiesTotal: number;
}

export interface MonthlyStats {
    month: string;
    incomeTotal: number;
    expenseTotal: number;
    net: number;
    purchasesTotal: number;
    salaryTotal: number;
    utilitiesTotal: number;
    dailyBreakdown: Array<{
        date: string;
        income: number;
        expense: number;
        net: number;
        purchases: number;
        salaries: number;
        utilities: number;
    }>;
}

export interface YearlyStats {
    year: number;
    incomeTotal: number;
    expenseTotal: number;
    net: number;
    purchasesTotal: number;
    salaryTotal: number;
    utilitiesTotal: number;
    monthlyBreakdown: Array<{
        month: string;
        income: number;
        expense: number;
        net: number;
        purchases: number;
        salaries: number;
        utilities: number;
    }>;
}

// ── Helper: sum utility amounts for a date range ────────────
function sumUtilities(from: string, to: string): number {
    return mockUtilities
        .filter((u) => u.date.slice(0, 10) >= from && u.date.slice(0, 10) <= to)
        .reduce((s, u) => s + u.amount, 0);
}

function sumUtilitiesForDay(day: string): number {
    return mockUtilities
        .filter((u) => u.date.slice(0, 10) === day)
        .reduce((s, u) => s + u.amount, 0);
}

export const statsApi = {
    getDaily: async (date: string): Promise<{ success: boolean; data: DailyStats }> => {
        await delay(300);
        const utilitiesTotal = sumUtilitiesForDay(date);
        return {
            success: true,
            data: {
                date,
                incomeTotal: 2_500_000,
                expenseTotal: 1_200_000 + utilitiesTotal,
                net: 2_500_000 - (1_200_000 + utilitiesTotal),
                purchasesTotal: 800_000,
                salaryTotal: 0,
                utilitiesTotal,
            }
        };
    },

    getMonthly: async (month: string): Promise<{ success: boolean; data: MonthlyStats }> => {
        await delay(500);
        // Calculate total utilities for the month
        const monthStart = `${month}-01`;
        const monthEnd = `${month}-31`;
        const utilitiesTotal = sumUtilities(monthStart, monthEnd);
        return {
            success: true,
            data: {
                ...mockMonthlyStats,
                utilitiesTotal,
                dailyBreakdown: mockMonthlyStats.dailyBreakdown.map((d) => ({
                    ...d,
                    utilities: sumUtilitiesForDay(d.date),
                })),
            }
        };
    },

    getYearly: async (year: number): Promise<{ success: boolean; data: YearlyStats }> => {
        await delay(500);
        const yearStart = `${year}-01-01`;
        const yearEnd = `${year}-12-31`;
        const utilitiesTotal = sumUtilities(yearStart, yearEnd);
        return {
            success: true,
            data: {
                year,
                incomeTotal: mockMonthlyStats.incomeTotal * 12,
                expenseTotal: mockMonthlyStats.expenseTotal * 12,
                net: mockMonthlyStats.net * 12,
                purchasesTotal: mockMonthlyStats.purchasesTotal * 12,
                salaryTotal: mockMonthlyStats.salaryTotal * 12,
                utilitiesTotal,
                monthlyBreakdown: Array.from({ length: 12 }, (_, i) => {
                    const m = `${year}-${(i + 1).toString().padStart(2, '0')}`;
                    const mStart = `${m}-01`;
                    const mEnd = `${m}-31`;
                    return {
                        month: m,
                        income: mockMonthlyStats.incomeTotal,
                        expense: mockMonthlyStats.expenseTotal,
                        net: mockMonthlyStats.net,
                        purchases: mockMonthlyStats.purchasesTotal,
                        salaries: mockMonthlyStats.salaryTotal,
                        utilities: sumUtilities(mStart, mEnd),
                    };
                })
            }
        };
    },
};

export const reportsApi = {
    getStockBalances: async () => {
        await delay(300);
        return { success: true, data: mockStockBalances };
    },

    getStockTransactions: async (query: { from?: string; to?: string; type?: string; itemId?: string }) => {
        await delay(300);
        return { success: true, data: [] };
    },

    getCashReport: async (query: { from?: string; to?: string; type?: string; category?: string }) => {
        await delay(300);
        return { success: true, data: [] };
    },

    getSalariesReport: async (month: string) => {
        await delay(300);
        return { success: true, data: [] };
    },
};

export default statsApi;
