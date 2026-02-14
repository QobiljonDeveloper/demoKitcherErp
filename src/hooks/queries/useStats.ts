import { useQuery } from '@tanstack/react-query';
import { statsApi, reportsApi } from '@/api/stats';

export const STATS_KEYS = {
    all: ['stats'] as const,
    daily: (date: string) => [...STATS_KEYS.all, 'daily', date] as const,
    monthly: (month: string) => [...STATS_KEYS.all, 'monthly', month] as const,
    yearly: (year: number) => [...STATS_KEYS.all, 'yearly', year] as const,
    reports: {
        stockBalances: ['reports', 'stockBalances'] as const,
        stockTransactions: (query: any) => ['reports', 'stockTransactions', query] as const,
        cash: (query: any) => ['reports', 'cash', query] as const,
        salaries: (month: string) => ['reports', 'salaries', month] as const,
    }
};

export function useDailyStats(date: string) {
    return useQuery({
        queryKey: STATS_KEYS.daily(date),
        queryFn: () => statsApi.getDaily(date),
        enabled: !!date,
    });
}

export function useMonthlyStats(month: string) {
    return useQuery({
        queryKey: STATS_KEYS.monthly(month),
        queryFn: () => statsApi.getMonthly(month),
        enabled: !!month,
    });
}

export function useYearlyStats(year: number) {
    return useQuery({
        queryKey: STATS_KEYS.yearly(year),
        queryFn: () => statsApi.getYearly(year),
        enabled: !!year,
    });
}

// Reports Hooks
export function useReportStockBalances() {
    return useQuery({
        queryKey: STATS_KEYS.reports.stockBalances,
        queryFn: reportsApi.getStockBalances,
    });
}

export function useReportStockTransactions(query: { from?: string; to?: string; type?: string; itemId?: string }) {
    return useQuery({
        queryKey: STATS_KEYS.reports.stockTransactions(query),
        queryFn: () => reportsApi.getStockTransactions(query),
    });
}

export function useReportCash(query: { from?: string; to?: string; type?: string; category?: string }) {
    return useQuery({
        queryKey: STATS_KEYS.reports.cash(query),
        queryFn: () => reportsApi.getCashReport(query),
    });
}

export function useReportSalaries(month: string) {
    return useQuery({
        queryKey: STATS_KEYS.reports.salaries(month),
        queryFn: () => reportsApi.getSalariesReport(month),
        enabled: !!month,
    });
}
