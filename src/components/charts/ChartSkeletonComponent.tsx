import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartSkeletonProps {
    title?: string;
    height?: number;
    className?: string;
}

export function ChartSkeleton({ title, height = 350, className }: ChartSkeletonProps) {
    return (
        <Card className={className}>
            {title && (
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-6 w-48" />
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent>
                <Skeleton style={{ height: `${height}px` }} className="w-full rounded-md" />
            </CardContent>
        </Card>
    );
}
