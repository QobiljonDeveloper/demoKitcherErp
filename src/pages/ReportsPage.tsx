import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parse, parseISO } from 'date-fns';
import { uz } from 'date-fns/locale';
import {
    Activity,
    AlertTriangle,
    Banknote,
    CalendarRange,
    CreditCard,
    DollarSign,
    Package,
    TrendingDown,
    TrendingUp,
    Wallet
} from 'lucide-react';
import { AreaChartCard, PieChartCard } from '@/components/charts';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

import { MonthPicker } from '@/components/ui/month-picker';

import { reportsApi, statsApi, MonthlyStats } from '@/api/stats';
import { ItemBalance } from '@/api/stock';
import { formatCurrency, formatQuantity } from '@/utils/unitConverter';

export function ReportsPage() {
    const [activeTab, setActiveTab] = useState('financial');
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

    // Fetch monthly stats
    const { data: statsData, isLoading: isStatsLoading } = useQuery({
        queryKey: ['reports', 'financial', selectedMonth],
        queryFn: () => statsApi.getMonthly(selectedMonth),
    });

    // Fetch stock balances
    const { data: balancesData, isLoading: isBalancesLoading } = useQuery({
        queryKey: ['reports', 'stock-balances'],
        queryFn: reportsApi.getStockBalances,
    });

    const stats: MonthlyStats | undefined = statsData?.data;
    const balances: ItemBalance[] = balancesData?.data || [];
    const lowStockItems = balances.filter((b) => b.belowMinStock);

    const chartData = stats?.dailyBreakdown.map(day => ({
        ...day,
        date: format(parseISO(day.date), 'dd'),
        fullDate: format(parseISO(day.date), 'dd MMMM', { locale: uz }),
        income: day.income,
        expense: day.expense,
        profit: day.net,
        utilities: day.utilities,
    })) || [];

    const expenseBreakdown = [
        { name: 'Xaridlar', value: stats?.purchasesTotal || 0, color: '#f59e0b' }, // amber
        { name: 'Maoshlar', value: stats?.salaryTotal || 0, color: '#3b82f6' },   // blue
        { name: 'Kommunal', value: stats?.utilitiesTotal || 0, color: '#f97316' }, // orange
        { name: 'Boshqa', value: Math.max(0, (stats?.expenseTotal || 0) - (stats?.purchasesTotal || 0) - (stats?.salaryTotal || 0) - (stats?.utilitiesTotal || 0)), color: '#ef4444' } // red
    ].filter(i => i.value > 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Hisobotlar</h1>
                    <p className="text-muted-foreground">Biznes ko'rsatkichlari va tahlillar</p>
                </div>

                <div className="flex items-center gap-2">
                    <Label className="hidden sm:block">Davr:</Label>
                    <MonthPicker
                        date={parse(selectedMonth, 'yyyy-MM', new Date())}
                        setDate={(date) => setSelectedMonth(format(date, 'yyyy-MM'))}
                    />
                </div>
            </div>

            {/* Warnings */}
            {lowStockItems.length > 0 && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader className="py-3">
                        <CardTitle className="text-base flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Diqqat: {lowStockItems.length} ta mahsulot kam qolgan
                        </CardTitle>
                    </CardHeader>
                </Card>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="financial">Moliyaviy Tahlil</TabsTrigger>
                    <TabsTrigger value="stock">Ombor Qoldiqlari</TabsTrigger>
                </TabsList>

                <TabsContent value="financial" className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Jami Kirim</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                {isStatsLoading ? <Skeleton className="h-8 w-24" /> : (
                                    <div className="text-2xl font-bold text-green-600">
                                        {formatCurrency(stats?.incomeTotal || 0)}
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">Oy davomida</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Jami Chiqim</CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                {isStatsLoading ? <Skeleton className="h-8 w-24" /> : (
                                    <div className="text-2xl font-bold text-red-600">
                                        {formatCurrency(stats?.expenseTotal || 0)}
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">Oy davomida</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sof Foyda</CardTitle>
                                <Wallet className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                {isStatsLoading ? <Skeleton className="h-8 w-24" /> : (
                                    <div className={`text-2xl font-bold ${(stats?.net || 0) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                                        {formatCurrency(stats?.net || 0)}
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">Kirim - Chiqim</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rentabellik</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isStatsLoading ? <Skeleton className="h-8 w-24" /> : (
                                    <div className="text-2xl font-bold">
                                        {stats?.incomeTotal ? Math.round(((stats.net) / stats.incomeTotal) * 100) : 0}%
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">Foyda foizi</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-7">
                        {/* Main Chart */}
                        <div className="col-span-4">
                            <AreaChartCard
                                title="Kirim va Chiqim Dinamikasi"
                                description="Kunlik moliyaviy oqimlar grafigi"
                                data={chartData}
                                xKey="date"
                                areas={[
                                    { dataKey: 'income', name: 'Kirim', color: '#22c55e', fillOpacity: 0.2 },
                                    { dataKey: 'expense', name: 'Chiqim', color: '#ef4444', fillOpacity: 0.2 },
                                    { dataKey: 'utilities', name: 'Kommunal', color: '#f97316', fillOpacity: 0.15 },
                                ]}
                                height={350}
                            />
                        </div>

                        {/* Expense Breakdown Chart */}
                        <div className="col-span-3">
                            <PieChartCard
                                title="Xarajatlar Tarkibi"
                                description="Xarajatlarning taqsimlanishi"
                                data={expenseBreakdown}
                                height={350}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="stock" className="space-y-4">
                    {isBalancesLoading ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Card key={i}>
                                    <CardContent className="p-4">
                                        <Skeleton className="h-6 w-32 mb-2" />
                                        <Skeleton className="h-8 w-24" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : balances.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                Ombor ma'lumotlari mavjud emas. Mahsulot va kirim qiling.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {balances.map((balance: ItemBalance) => (
                                <Card
                                    key={balance.itemId}
                                    className={balance.belowMinStock ? 'border-destructive' : ''}
                                >
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                {balance.itemName}
                                            </span>
                                            {balance.belowMinStock && (
                                                <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-full">
                                                    Kam
                                                </span>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className={`text-2xl font-bold ${balance.belowMinStock ? 'text-destructive' : ''}`}>
                                            {formatQuantity(balance.balance, balance.unit)}
                                        </p>
                                        {balance.minStock && (
                                            <p className={`text-sm mt-1 ${balance.belowMinStock ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                Min: {formatQuantity(balance.minStock, balance.unit)}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default ReportsPage;
