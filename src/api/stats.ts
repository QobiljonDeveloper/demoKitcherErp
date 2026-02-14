import { delay } from './mockUtils';
import { mockMonthlyStats } from '../mocks/stats';
import { mockStockBalances } from '../mocks/stock';

export interface DailyStats {
    date: string;
    incomeTotal: number;
    expenseTotal: number;
    net: number;
    purchasesTotal: number;
    salaryTotal: number;
}

export interface MonthlyStats {
    month: string;
    incomeTotal: number;
    expenseTotal: number;
    net: number;
    purchasesTotal: number;
    salaryTotal: number;
    dailyBreakdown: Array<{
        date: string;
        income: number;
        expense: number;
        net: number;
        purchases: number;
        salaries: number;
    }>;
}

export interface YearlyStats {
    year: number;
    incomeTotal: number;
    expenseTotal: number;
    net: number;
    purchasesTotal: number;
    salaryTotal: number;
    monthlyBreakdown: Array<{
        month: string;
        income: number;
        expense: number;
        net: number;
        purchases: number;
        salaries: number;
    }>;
}

export const statsApi = {
    getDaily: async (date: string): Promise<{ success: boolean; data: DailyStats }> => {
        await delay(300);
        return {
            success: true,
            data: {
                date,
                incomeTotal: 0,
                expenseTotal: 0,
                net: 0,
                purchasesTotal: 0,
                salaryTotal: 0
            }
        };
    },

    getMonthly: async (month: string): Promise<{ success: boolean; data: MonthlyStats }> => {
        await delay(500);
        return { success: true, data: mockMonthlyStats };
    },

    getYearly: async (year: number): Promise<{ success: boolean; data: YearlyStats }> => {
        await delay(500);
        return {
            success: true,
            data: {
                year,
                incomeTotal: mockMonthlyStats.incomeTotal * 12,
                expenseTotal: mockMonthlyStats.expenseTotal * 12,
                net: mockMonthlyStats.net * 12,
                purchasesTotal: mockMonthlyStats.purchasesTotal * 12,
                salaryTotal: mockMonthlyStats.salaryTotal * 12,
                monthlyBreakdown: Array.from({ length: 12 }, (_, i) => ({
                    month: `${year}-${(i + 1).toString().padStart(2, '0')}`,
                    income: mockMonthlyStats.incomeTotal,
                    expense: mockMonthlyStats.expenseTotal,
                    net: mockMonthlyStats.net,
                    purchases: mockMonthlyStats.purchasesTotal,
                    salaries: mockMonthlyStats.salaryTotal
                }))
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
