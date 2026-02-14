import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
    title?: string;
    description?: string;
    onRetry?: () => void;
    retryLabel?: string;
}

export function ErrorState({
    title = "Xatolik yuz berdi",
    description = "Ma'lumotlarni yuklashda xatolik. Qaytadan urinib ko'ring.",
    onRetry,
    retryLabel = "Qayta yuklash",
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
            {onRetry && (
                <Button variant="outline" onClick={onRetry}>{retryLabel}</Button>
            )}
        </div>
    );
}
