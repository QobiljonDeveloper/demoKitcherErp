import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/unitConverter";

interface BarChartCardProps {
    title: string;
    description?: string;
    data: any[];
    xKey: string;
    bars: {
        dataKey: string;
        name: string;
        color: string;
        stackId?: string;
    }[];
    height?: number;
    className?: string;
}

export function BarChartCard({
    title,
    description,
    data,
    xKey,
    bars,
    height = 350,
    className
}: BarChartCardProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div style={{ height: `${height}px` }} className="w-full">
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                <XAxis
                                    dataKey={xKey}
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--popover))',
                                        borderColor: 'hsl(var(--border))',
                                        color: 'hsl(var(--popover-foreground))',
                                        borderRadius: 'var(--radius)',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                    formatter={(value: number) => [formatCurrency(value), '']}
                                    labelStyle={{ color: 'hsl(var(--foreground))', marginBottom: '0.25rem' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                {bars.map((bar, index) => (
                                    <Bar
                                        key={bar.dataKey}
                                        dataKey={bar.dataKey}
                                        name={bar.name}
                                        fill={bar.color}
                                        radius={[4, 4, 0, 0]}
                                        stackId={bar.stackId}
                                        animationDuration={1500}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Ma'lumot mavjud emas
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
