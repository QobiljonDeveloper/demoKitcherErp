import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    variant?: 'destructive' | 'default';
    loading?: boolean;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title = "Tasdiqlash",
    description = "Rostdan ham o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.",
    confirmText = "O'chirish",
    cancelText = "Bekor qilish",
    onConfirm,
    variant = 'destructive',
    loading = false,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={loading}
                        className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                    >
                        {loading ? 'Yuklanmoqda...' : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
