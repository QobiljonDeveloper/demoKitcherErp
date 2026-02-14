import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/unitConverter";

interface PieChartCardProps {
    title: string;
    description?: string;
    data: { name: string; value: number; color?: string }[];
    height?: number;
    className?: string;
    dataKey?: string;
    nameKey?: string;
    innerRadius?: number;
    outerRadius?: number;
}

const DEFAULT_COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export function PieChartCard({
    title,
    description,
    data,
    height = 350,
    className,
    dataKey = "value",
    nameKey = "name",
    innerRadius = 60,
    outerRadius = 80
}: PieChartCardProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div style={{ height: `${height}px` }} className="w-full">
                    {data.filter(i => i.value > 0).length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={innerRadius}
                                    outerRadius={outerRadius}
                                    paddingAngle={5}
                                    dataKey={dataKey}
                                    nameKey={nameKey}
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                                            strokeWidth={2}
                                            stroke="hsl(var(--card))"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--popover))',
                                        borderColor: 'hsl(var(--border))',
                                        color: 'hsl(var(--popover-foreground))',
                                        borderRadius: 'var(--radius)',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                    formatter={(value: number) => [formatCurrency(value), '']}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                />
                            </PieChart>
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
