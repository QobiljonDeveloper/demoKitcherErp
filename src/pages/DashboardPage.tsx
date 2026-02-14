import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChartCard, LineChartCard, ChartSkeleton } from '@/components/charts';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyStats, useMonthlyStats, useYearlyStats } from '@/hooks/queries/useStats';
import { formatCurrency } from '@/utils/unitConverter';

export function DashboardPage() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentMonth = format(new Date(), 'yyyy-MM');
    const currentYear = new Date().getFullYear();

    // Fetch daily stats
    const { data: dailyData, isLoading: isDailyLoading } = useDailyStats(today);

    // Fetch monthly stats
    const { data: monthlyData, isLoading: isMonthlyLoading } = useMonthlyStats(currentMonth);

    // Fetch yearly stats
    const { data: yearlyData, isLoading: isYearlyLoading } = useYearlyStats(currentYear);

    const daily = dailyData?.data;
    const monthly = monthlyData?.data;
    const yearly = yearlyData?.data;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Bosh sahifa</h1>
                <p className="text-muted-foreground">Oshxona faoliyati haqida qisqacha</p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
                <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link to="/cash">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Yangi kirim
                    </Link>
                </Button>
                <Button asChild variant="destructive">
                    <Link to="/cash">
                        <TrendingDown className="mr-2 h-4 w-4" />
                        Yangi xarajat
                    </Link>
                </Button>
                <Button asChild variant="outline">
                    <Link to="/stock">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Yangi xarid
                    </Link>
                </Button>
                <Button asChild variant="secondary">
                    <Link to="/employees">
                        <Users className="mr-2 h-4 w-4" />
                        Xodim qo'shish
                    </Link>
                </Button>
            </div>

            {/* Today's Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Bugungi tushum"
                    value={daily?.incomeTotal}
                    icon={TrendingUp}
                    isLoading={isDailyLoading}
                    color="text-green-500"
                />
                <StatCard
                    title="Bugungi xarajat"
                    value={daily?.expenseTotal}
                    icon={TrendingDown}
                    isLoading={isDailyLoading}
                    color="text-red-500"
                />
                <StatCard
                    title="Bugungi foyda"
                    value={daily?.net}
                    icon={DollarSign}
                    isLoading={isDailyLoading}
                    color={daily?.net && daily.net >= 0 ? 'text-green-500' : 'text-red-500'}
                />
                <StatCard
                    title="Bugungi xaridlar"
                    value={daily?.purchasesTotal}
                    icon={ShoppingCart}
                    isLoading={isDailyLoading}
                    color="text-blue-500"
                />
            </div>

            {/* Monthly Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Oylik tushum"
                    value={monthly?.incomeTotal}
                    icon={TrendingUp}
                    isLoading={isMonthlyLoading}
                    color="text-green-500"
                    subtitle={currentMonth}
                />
                <StatCard
                    title="Oylik xarajat"
                    value={monthly?.expenseTotal}
                    icon={TrendingDown}
                    isLoading={isMonthlyLoading}
                    color="text-red-500"
                    subtitle={currentMonth}
                />
                <StatCard
                    title="Oylik foyda"
                    value={monthly?.net}
                    icon={DollarSign}
                    isLoading={isMonthlyLoading}
                    color={monthly?.net && monthly.net >= 0 ? 'text-green-500' : 'text-red-500'}
                    subtitle={currentMonth}
                />
                <StatCard
                    title="Oylik maoshlar"
                    value={monthly?.salaryTotal}
                    icon={Users}
                    isLoading={isMonthlyLoading}
                    color="text-purple-500"
                    subtitle={currentMonth}
                />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Daily Bar Chart */}
                {isDailyLoading ? (
                    <ChartSkeleton />
                ) : daily ? (
                    <BarChartCard
                        title={`Kunlik hisobot (${today})`}
                        data={[
                            { name: 'Tushum', value: daily.incomeTotal },
                            { name: 'Xarajat', value: daily.expenseTotal },
                            { name: 'Foyda', value: daily.net },
                        ]}
                        xKey="name"
                        bars={[{ dataKey: 'value', name: 'Miqdor', color: 'hsl(var(--primary))' }]}
                    />
                ) : (
                    <EmptyChart title="Kunlik hisobot" message="Bugun uchun ma'lumot yo'q" />
                )}

                {/* Monthly Line Chart */}
                {isMonthlyLoading ? (
                    <ChartSkeleton />
                ) : monthly?.dailyBreakdown ? (
                    <LineChartCard
                        title={`Oylik dinamika (${currentMonth})`}
                        description="Kirim, chiqim va foyda dinamikasi"
                        data={monthly.dailyBreakdown.map((d) => ({
                            date: d.date.split('-')[2], // Just the day number
                            income: d.income,
                            expense: d.expense,
                            net: d.net,
                        }))}
                        xKey="date"
                        areas={[
                            { dataKey: 'income', name: 'Tushum', color: '#22c55e', fillOpacity: 0.1 },
                            { dataKey: 'expense', name: 'Xarajat', color: '#ef4444', fillOpacity: 0.1 },
                            { dataKey: 'net', name: 'Foyda', color: 'hsl(var(--primary))', fillOpacity: 0.2 },
                        ]}
                    />
                ) : (
                    <EmptyChart title="Oylik dinamika" message="Oylik ma'lumot yo'q" />
                )}
            </div>

            {/* Yearly Bar Chart */}
            <div>
                {isYearlyLoading ? (
                    <ChartSkeleton height={350} />
                ) : yearly?.monthlyBreakdown ? (
                    <BarChartCard
                        title={`Yillik ko'rsatkichlar (${currentYear})`}
                        data={yearly.monthlyBreakdown.map((m) => ({
                            month: m.month.split('-')[1], // Just the month number
                            income: m.income,
                            expense: m.expense,
                            net: m.net,
                        }))}
                        xKey="month"
                        bars={[
                            { dataKey: 'income', name: 'Tushum', color: '#22c55e' },
                            { dataKey: 'expense', name: 'Xarajat', color: '#ef4444' },
                            { dataKey: 'net', name: 'Foyda', color: 'hsl(var(--primary))' },
                        ]}
                        height={350}
                    />
                ) : (
                    <EmptyChart title="Yillik ko'rsatkichlar" message="Yillik ma'lumot yo'q" />
                )}
            </div>
        </div>
    );
}

// Stat Card Component
interface StatCardProps {
    title: string;
    value: number | undefined;
    icon: React.ElementType;
    isLoading: boolean;
    color: string;
    subtitle?: string;
}

function StatCard({ title, value, icon: Icon, isLoading, color, subtitle }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>
                <Icon className={`h-5 w-5 ${color}`} />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                ) : (
                    <p className={`text-2xl font-bold truncate ${color}`} title={formatCurrency(value ?? 0)}>
                        {formatCurrency(value ?? 0)}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// Empty Chart placeholder
function EmptyChart({ title, message }: { title: string; message: string }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    {message}
                </div>
            </CardContent>
        </Card>
    );
}

export default DashboardPage;
