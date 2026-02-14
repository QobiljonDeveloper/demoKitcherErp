import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/unitConverter";

interface AreaChartCardProps {
    title: string;
    description?: string;
    data: any[];
    xKey: string;
    areas: {
        dataKey: string;
        name: string;
        color: string;
        fillOpacity?: number;
    }[];
    height?: number;
    className?: string;
}

export function AreaChartCard({
    title,
    description,
    data,
    xKey,
    areas,
    height = 350,
    className
}: AreaChartCardProps) {
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
                            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    {areas.map((area, index) => (
                                        <linearGradient key={`gradient-${area.dataKey}`} id={`gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={area.color} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={area.color} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
                                </defs>
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
                                {areas.map((area) => (
                                    <Area
                                        key={area.dataKey}
                                        type="monotone"
                                        dataKey={area.dataKey}
                                        name={area.name}
                                        stroke={area.color}
                                        fillOpacity={area.fillOpacity ?? 1}
                                        fill={`url(#gradient-${area.dataKey})`}
                                        strokeWidth={2}
                                        animationDuration={1500}
                                    />
                                ))}
                            </AreaChart>
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

// Also export as LineChartCard for backward compatibility or alias, though implementation maps to Area for better visuals
export const LineChartCard = AreaChartCard;
