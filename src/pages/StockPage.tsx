import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import {
    Plus,
    Trash2,
    ArrowDownCircle,
    ArrowUpCircle,
    ArrowUpDown,
    MoreHorizontal
} from 'lucide-react';
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import { StockTransaction, ItemBalance } from '@/api/stock';
import { Item } from '@/api/items';
import { useStockTransactions, useStockBalances, useCreateStockIn, useCreateStockOut, useDeleteStockTransaction } from '@/hooks/queries/useStock';
import { useActiveItems } from '@/hooks/queries/useItems';
import { formatQuantity, formatCurrency, toBaseUnit, toBasePrice } from '@/utils/unitConverter';


const stockInSchema = z.object({
    itemId: z.string().min(1, 'Mahsulot tanlanishi shart'),
    date: z.string().min(1, 'Sana kiritilishi shart'),
    quantity: z.coerce.number().min(0.001, 'Miqdor 0 dan katta bo\'lishi kerak').max(1000000, 'Miqdor juda katta'),
    unitPrice: z.coerce.number().min(0).max(1000000000, 'Narx juda katta').optional(),
    supplier: z.string().optional(),
    note: z.string().optional(),
});

const stockOutSchema = z.object({
    itemId: z.string().min(1, 'Mahsulot tanlanishi shart'),
    date: z.string().min(1, 'Sana kiritilishi shart'),
    quantity: z.coerce.number().min(0.001, 'Miqdor 0 dan katta bo\'lishi kerak').max(1000000, 'Miqdor juda katta'),
    note: z.string().optional(),
});

type StockInFormData = z.infer<typeof stockInSchema>;
type StockOutFormData = z.infer<typeof stockOutSchema>;

export function StockPage() {
    const [activeTab, setActiveTab] = useState('balances');
    const [isInDialogOpen, setIsInDialogOpen] = useState(false);
    const [isOutDialogOpen, setIsOutDialogOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

    // Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    // Fetch balances
    const { data: balancesData, isLoading: isBalancesLoading } = useStockBalances();

    // Fetch transactions
    const { data: transactionsData, isLoading: isTransactionsLoading, isError, refetch } = useStockTransactions({ limit: 1000 });

    // Fetch active items for dropdown
    const { data: itemsData } = useActiveItems();

    const createInMutation = useCreateStockIn();
    const createOutMutation = useCreateStockOut();
    const deleteMutation = useDeleteStockTransaction();

    const {
        register: registerIn,
        handleSubmit: handleSubmitIn,
        control: controlIn,
        reset: resetIn,
        setValue: setValueIn,
        watch: watchIn,
        formState: { errors: errorsIn },
    } = useForm<StockInFormData>({
        resolver: zodResolver(stockInSchema),
        mode: 'onChange',
        defaultValues: {
            date: format(new Date(), 'yyyy-MM-dd'),
        },
    });

    const {
        register: registerOut,
        handleSubmit: handleSubmitOut,
        control: controlOut,
        reset: resetOut,
        setValue: setValueOut,
        watch: watchOut,
        formState: { errors: errorsOut },
    } = useForm<StockOutFormData>({
        resolver: zodResolver(stockOutSchema),
        mode: 'onChange',
        defaultValues: {
            date: format(new Date(), 'yyyy-MM-dd'),
        },
    });

    const onSubmitIn = (data: StockInFormData) => {
        createInMutation.mutate(data, {
            onSuccess: () => {
                setIsInDialogOpen(false);
                resetIn();
                toast.success('Kirim muvaffaqiyatli qo\'shildi');
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
            }
        });
    };

    const onSubmitOut = (data: StockOutFormData) => {
        createOutMutation.mutate(data, {
            onSuccess: () => {
                setIsOutDialogOpen(false);
                resetOut();
                toast.success('Chiqim muvaffaqiyatli qo\'shildi');
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Xatolik yuz berdi. Balki qoldiq yetarli emasdir?');
            }
        });
    };

    const columns = useMemo<ColumnDef<StockTransaction>[]>(() => [
        {
            accessorKey: 'date',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Sana
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
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
                    <div className={`flex items-center gap-2 font-medium ${type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                        {type === 'IN' ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
                        {type === 'IN' ? 'Kirim' : 'Chiqim'}
                    </div>
                );
            }
        },
        {
            accessorFn: (row) => row.itemId?.name || 'O\'chirilgan',
            id: 'itemName',
            header: 'Mahsulot',
        },
        {
            accessorKey: 'quantity',
            header: 'Miqdor',
            cell: ({ row }) => {
                const qty = row.getValue("quantity") as number;
                const unit = row.original.itemId?.unit || 'dona';
                return <div className="font-medium">{formatQuantity(qty, unit)}</div>;
            }
        },
        {
            accessorKey: 'totalPrice',
            header: 'Summa',
            cell: ({ row }) => {
                const price = row.getValue("totalPrice") as number | null;
                return price ? formatCurrency(price) : '-';
            }
        },
        {
            accessorKey: 'supplier',
            header: 'Yetkazib beruvchi',
            cell: ({ row }) => row.getValue("supplier") || '-',
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
        data: transactionsData?.data || [],
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

    const balances = balancesData?.data || [];
    const items = itemsData?.data || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Ombor</h1>
                    <p className="text-muted-foreground">Ombor harakatlarini boshqarish (Kirim / Chiqim)</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsInDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                        <ArrowDownCircle className="h-4 w-4 mr-2" />
                        Kirim
                    </Button>
                    <Button onClick={() => setIsOutDialogOpen(true)} variant="destructive">
                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                        Chiqim
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="balances">Qoldiqlar</TabsTrigger>
                    <TabsTrigger value="transactions">Tarix</TabsTrigger>
                </TabsList>

                <TabsContent value="balances" className="mt-4">
                    {isBalancesLoading ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
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
                                Hozircha qoldiqlar mavjud emas. Mahsulot qo'shing va kirim qiling.
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
                                        <CardTitle className="text-lg">{balance.itemName}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">
                                            {formatQuantity(balance.balance, balance.unit)}
                                        </p>
                                        {balance.minStock && (
                                            <p className={`text-sm ${balance.belowMinStock ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                Min: {formatQuantity(balance.minStock, balance.unit)}
                                                {balance.belowMinStock && ' ⚠️ Kam qoldiq!'}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="transactions" className="mt-4">
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
                                            {isTransactionsLoading ? 'Yuklanmoqda...' : 'Hozircha ma\'lumot yo\'q'}
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
                </TabsContent>
            </Tabs>

            {/* Stock IN Dialog */}
            <Dialog open={isInDialogOpen} onOpenChange={setIsInDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Kirim qilish</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitIn(onSubmitIn)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Mahsulot</Label>
                            <Select
                                value={watchIn('itemId')}
                                onValueChange={(v) => setValueIn('itemId', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Mahsulotni tanlang" />
                                </SelectTrigger>
                                <SelectContent>
                                    {items.map((item: Item) => (
                                        <SelectItem key={item._id} value={item._id}>
                                            {item.name} ({item.unit})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errorsIn.itemId && <p className="text-sm text-destructive">{errorsIn.itemId.message}</p>}
                        </div>

                        {watchIn('itemId') && (
                            <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded-md">
                                Tanlangan: <strong>{items.find(i => i._id === watchIn('itemId'))?.name}</strong>
                                (O'lchov: {items.find(i => i._id === watchIn('itemId'))?.unit})
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dateIn">Sana</Label>
                                <Controller
                                    control={controlIn}
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
                                {errorsIn.date && <p className="text-sm text-destructive">{errorsIn.date.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantityIn">
                                    Miqdor {watchIn('itemId') ? `(${items.find(i => i._id === watchIn('itemId'))?.unit})` : ''}
                                </Label>
                                <Controller
                                    control={controlIn}
                                    name="quantity"
                                    render={({ field: { onChange, value, ref } }) => (
                                        <MoneyInput
                                            id="quantityIn"
                                            value={value}
                                            onValueChange={(values) => onChange(values.floatValue)}
                                            getInputRef={ref}
                                            error={!!errorsIn.quantity}
                                            max={1000000}
                                        />
                                    )}
                                />
                                {errorsIn.quantity && <p className="text-sm text-destructive">{errorsIn.quantity.message}</p>}
                                {watchIn('itemId') && (watchIn('quantity') ?? 0) > 0 && (
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Saqlanadi: {formatQuantity(toBaseUnit(watchIn('quantity') || 0, items.find(i => i._id === watchIn('itemId'))?.unit || 'piece'), items.find(i => i._id === watchIn('itemId'))?.unit || 'piece')}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="unitPrice">
                                    Narxi {watchIn('itemId') ? `(${items.find(i => i._id === watchIn('itemId'))?.unit})` : ''}
                                </Label>
                                <Controller
                                    control={controlIn}
                                    name="unitPrice"
                                    render={({ field: { onChange, value, ref } }) => (
                                        <MoneyInput
                                            id="unitPrice"
                                            value={value}
                                            onValueChange={(values) => onChange(values.floatValue)}
                                            getInputRef={ref}
                                            error={!!errorsIn.unitPrice}
                                            max={1000000000}
                                        />
                                    )}
                                />
                                {errorsIn.unitPrice && <p className="text-sm text-destructive">{errorsIn.unitPrice.message}</p>}
                                {watchIn('itemId') && (watchIn('unitPrice') ?? 0) > 0 && (
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Saqlanadi: {formatCurrency(watchIn('unitPrice') || 0)}/{items.find(i => i._id === watchIn('itemId'))?.unit}
                                        {" => "}
                                        {formatCurrency(toBasePrice(watchIn('unitPrice') || 0, items.find(i => i._id === watchIn('itemId'))?.unit || 'piece'))}/{items.find(i => i._id === watchIn('itemId'))?.unit === 'kg' ? 'g' : items.find(i => i._id === watchIn('itemId'))?.unit === 'liter' ? 'ml' : 'dona'}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="supplier">Yetkazib beruvchi</Label>
                                <Input id="supplier" {...registerIn('supplier')} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="noteIn">Izoh</Label>
                            <Input id="noteIn" {...registerIn('note')} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsInDialogOpen(false)}>
                                Bekor qilish
                            </Button>
                            <Button type="submit" disabled={createInMutation.isPending}>
                                Kirim qilish
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Stock OUT Dialog */}
            <Dialog open={isOutDialogOpen} onOpenChange={setIsOutDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chiqim qilish</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitOut(onSubmitOut)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Mahsulot</Label>
                            <Select
                                value={watchOut('itemId')}
                                onValueChange={(v) => setValueOut('itemId', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Mahsulotni tanlang" />
                                </SelectTrigger>
                                <SelectContent>
                                    {items.map((item: Item) => (
                                        <SelectItem key={item._id} value={item._id}>
                                            {item.name} ({item.unit})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errorsOut.itemId && <p className="text-sm text-destructive">{errorsOut.itemId.message}</p>}
                        </div>

                        {watchOut('itemId') && (
                            <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded-md">
                                Tanlangan: <strong>{items.find(i => i._id === watchOut('itemId'))?.name}</strong>
                                (O'lchov: {items.find(i => i._id === watchOut('itemId'))?.unit})
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dateOut">Sana</Label>
                                <Controller
                                    control={controlOut}
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
                                {errorsOut.date && <p className="text-sm text-destructive">{errorsOut.date.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantityOut">
                                    Miqdor {watchOut('itemId') ? `(${items.find(i => i._id === watchOut('itemId'))?.unit})` : ''}
                                </Label>
                                <Controller
                                    control={controlOut}
                                    name="quantity"
                                    render={({ field: { onChange, value, ref } }) => (
                                        <MoneyInput
                                            id="quantityOut"
                                            value={value}
                                            onValueChange={(values) => onChange(values.floatValue)}
                                            getInputRef={ref}
                                            error={!!errorsOut.quantity}
                                            max={1000000}
                                        />
                                    )}
                                />
                                {errorsOut.quantity && <p className="text-sm text-destructive">{errorsOut.quantity.message}</p>}
                                {watchOut('itemId') && (watchOut('quantity') ?? 0) > 0 && (
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Saqlanadi: {formatQuantity(toBaseUnit(watchOut('quantity') || 0, items.find(i => i._id === watchOut('itemId'))?.unit || 'piece'), items.find(i => i._id === watchOut('itemId'))?.unit || 'piece')}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="noteOut">Izoh</Label>
                            <Input id="noteOut" {...registerOut('note')} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOutDialogOpen(false)}>
                                Bekor qilish
                            </Button>
                            <Button type="submit" variant="destructive" disabled={createOutMutation.isPending}>
                                Chiqim qilish
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
                description="Ushbu amaliyotni o'chirmoqchimisiz? Bu ombor qoldig'iga ta'sir qilishi mumkin."
            />
        </div>
    );
}

export default StockPage;
