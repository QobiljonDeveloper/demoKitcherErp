import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import {
    Plus,
    Trash2,
    TrendingUp,
    TrendingDown,
    ArrowUpDown,
    MoreHorizontal
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';


import { ConfirmDialog, EmptyState, ErrorState } from '@/components/common';
import { CashTransaction } from '@/api/cash';
import { useCashTransactions, useCreateCashTransaction, useDeleteCashTransaction } from '@/hooks/queries/useCash';
import { formatCurrency } from '@/utils/unitConverter';


const cashSchema = z.object({
    type: z.enum(['INCOME', 'EXPENSE']),
    amount: z.coerce.number().min(1, 'Summa kamida 1 bo\'lishi kerak').max(1000000000, 'Summa juda katta'),
    date: z.string().min(1, 'Sana kiritilishi shart'),
    category: z.string().optional(),
    note: z.string().optional(),
});

type CashFormData = z.infer<typeof cashSchema>;

const CATEGORIES = {
    INCOME: [
        { value: 'SALES', label: 'Savdo' },
        { value: 'PURCHASES', label: 'Xarid' },
        { value: 'UTILITIES', label: 'Kommunal' },
        { value: 'SALARIES', label: 'Maosh' },
        { value: 'RENT', label: 'Ijara' },
        { value: 'MAINTENANCE', label: 'Ta\'mirlash' },
        { value: 'OTHER', label: 'Boshqa' }
    ],
    EXPENSE: [
        { value: 'SALES', label: 'Savdo' },
        { value: 'PURCHASES', label: 'Xarid' },
        { value: 'UTILITIES', label: 'Kommunal' },
        { value: 'SALARIES', label: 'Maosh' },
        { value: 'RENT', label: 'Ijara' },
        { value: 'MAINTENANCE', label: 'Ta\'mirlash' },
        { value: 'OTHER', label: 'Boshqa' }
    ],
};

const CATEGORY_LABELS: Record<string, string> = {
    SALES: 'Savdo',
    PURCHASES: 'Xarid',
    UTILITIES: 'Kommunal',
    SALARIES: 'Maosh',
    RENT: 'Ijara',
    MAINTENANCE: 'Ta\'mirlash',
    OTHER: 'Boshqa',
};

export function CashPage() {
    const [activeTab, setActiveTab] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

    // Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const queryParams = useMemo(() => ({
        type: activeTab === 'ALL' ? undefined : activeTab,
        limit: 1000,
    }), [activeTab]);

    const { data: cashData, isLoading, isError, refetch } = useCashTransactions(queryParams);

    // Reset pagination when tab changes
    useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, [activeTab]);

    const createMutation = useCreateCashTransaction();
    const deleteMutation = useDeleteCashTransaction();

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CashFormData>({
        resolver: zodResolver(cashSchema),
        mode: 'onChange',
        defaultValues: {
            type: 'INCOME',
            date: format(new Date(), 'yyyy-MM-dd'),
        },
    });

    const watchType = watch('type');

    const onSubmit = (data: CashFormData) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                setIsDialogOpen(false);
                reset();
                toast.success('Amaliyot muvaffaqiyatli bajarildi');
            },
            onError: () => {
                toast.error('Xatolik yuz berdi');
            }
        });
    };

    const handleAddNew = (type: 'INCOME' | 'EXPENSE') => {
        reset({
            type,
            date: format(new Date(), 'yyyy-MM-dd'),
        });
        setIsDialogOpen(true);
    };

    const columns = useMemo<ColumnDef<CashTransaction>[]>(() => [
        {
            accessorKey: 'date',
            header: 'Sana',
            cell: ({ row }) => {
                const date = new Date(row.getValue("date"));
                return <div className="ml-4">{format(date, 'dd.MM.yyyy')}</div>;
            }
        },
        {
            accessorKey: 'type',
            header: 'Tur',
            cell: ({ row }) => {
                const type = row.getValue("type") as string;
                return (
                    <div className={`flex items-center gap-2 font-medium ${type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {type === 'INCOME' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {type === 'INCOME' ? 'Kirim' : 'Chiqim'}
                    </div>
                );
            }
        },
        {
            accessorKey: 'amount',
            header: 'Summa',
            cell: ({ row }) => {
                const amount = row.getValue("amount") as number;
                return <div className="font-bold">{formatCurrency(amount)}</div>;
            }
        },
        {
            accessorKey: 'category',
            header: 'Kategoriya',
            cell: ({ row }) => {
                const type = row.getValue("type") as string;
                const category = row.getValue("category") as string;
                const label = CATEGORY_LABELS[category] || category;
                return label || (type === 'INCOME' ? 'Kirim' : 'Chiqim');
            }
        },
        {
            accessorKey: 'note',
            header: 'Izoh',
            cell: ({ row }) => row.getValue("note") || '-',
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                return (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setTransactionToDelete(row.original._id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                );
            },
        },
    ], []);

    const table = useReactTable({
        data: cashData?.data || [],
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onPaginationChange: setPagination,
        state: {
            sorting,
            pagination,
        },
    });

    if (isError) {
        return <ErrorState onRetry={() => refetch()} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Moliya</h1>
                    <p className="text-muted-foreground">Kirim va chiqimlarni boshqarish</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => handleAddNew('INCOME')} className="bg-green-600 hover:bg-green-700">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Kirim
                    </Button>
                    <Button onClick={() => handleAddNew('EXPENSE')} variant="destructive">
                        <TrendingDown className="h-4 w-4 mr-2" />
                        Chiqim
                    </Button>
                </div>
            </div>

            <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                <button
                    onClick={() => setActiveTab('ALL')}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === 'ALL' ? 'bg-background text-foreground shadow-sm' : ''}`}
                >
                    Barchasi
                </button>
                <button
                    onClick={() => setActiveTab('INCOME')}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === 'INCOME' ? 'bg-background text-foreground shadow-sm' : ''}`}
                >
                    Kirim
                </button>
                <button
                    onClick={() => setActiveTab('EXPENSE')}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === 'EXPENSE' ? 'bg-background text-foreground shadow-sm' : ''}`}
                >
                    Chiqim
                </button>
            </div>

            <div className="mt-4">
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        {isLoading ? 'Yuklanmoqda...' : 'Hozircha ma\'lumot yo\'q'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Jami {table.getFilteredRowModel().rows.length} ta amaliyot
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Oldingi
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Keyingi
                        </Button>
                    </div>
                </div>
            </div>

            {/* Add Transaction Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {watchType === 'INCOME' ? 'Kirim qo\'shish' : 'Chiqim qo\'shish'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tur</Label>
                            <Select
                                value={watchType}
                                onValueChange={(v) => setValue('type', v as 'INCOME' | 'EXPENSE')}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INCOME">Kirim</SelectItem>
                                    <SelectItem value="EXPENSE">Chiqim</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Summa</Label>
                                <Controller
                                    control={control}
                                    name="amount"
                                    render={({ field: { onChange, value, ref } }) => (
                                        <MoneyInput
                                            id="amount"
                                            value={value}
                                            onValueChange={(values) => onChange(values.floatValue)}
                                            getInputRef={ref}
                                            error={!!errors.amount}
                                            max={1000000000}
                                        />
                                    )}
                                />
                                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Sana</Label>
                                <Controller
                                    control={control}
                                    name="date"
                                    render={({ field: { value, onChange } }) => (
                                        <Input
                                            type="date"
                                            value={value}
                                            onChange={onChange}
                                            className="w-full block"
                                        />
                                    )}
                                />
                                {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Kategoriya</Label>
                            <Select
                                value={watch('category') || ''}
                                onValueChange={(v) => setValue('category', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Kategoriyani tanlang" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES[watchType].map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="note">Izoh</Label>
                            <Input id="note" {...register('note')} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Bekor qilish
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending}
                                className={watchType === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : ''}
                                variant={watchType === 'EXPENSE' ? 'destructive' : 'default'}
                            >
                                {watchType === 'INCOME' ? 'Kirim qilish' : 'Chiqim qilish'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!transactionToDelete}
                onOpenChange={(open) => !open && setTransactionToDelete(null)}
                onConfirm={() => transactionToDelete && deleteMutation.mutate(transactionToDelete, {
                    onSuccess: () => {
                        setTransactionToDelete(null);
                        toast.success('Amaliyot o\'chirildi');
                    },
                    onError: () => {
                        toast.error('Xatolik yuz berdi');
                    }
                })}
                title="O'chirishni tasdiqlang"
                description="Ushbu o'tkazmani o'chirmoqchimisiz? Bu umumiy balansga ta'sir qiladi."
            />
        </div>
    );
}

export default CashPage;
