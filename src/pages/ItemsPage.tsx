import { useState, useMemo } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    ChevronDown,
    MoreHorizontal,
    ArrowUpDown
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

import { ConfirmDialog, EmptyState, ErrorState } from '@/components/common';
import { Item, CreateItemRequest } from '@/api/items';
import { useItems, useCreateItem, useUpdateItem, useDeleteItem } from '@/hooks/queries/useItems';
import { formatCurrency, fromBaseUnit, fromBasePrice, formatQuantity, toBaseUnit, toBasePrice } from '@/utils/unitConverter';

const itemSchema = z.object({
    name: z.string().min(1, 'Nom kiritilishi shart'),
    itemType: z.enum(['INGREDIENT', 'SUPPLY', 'CLEANING', 'PACKAGING', 'OTHER']),
    unitType: z.enum(['WEIGHT', 'VOLUME', 'COUNT']),
    unit: z.enum(['kg', 'g', 'liter', 'ml', 'piece']),
    minStock: z.coerce.number().min(0).max(1000000, 'Miqdor juda katta').optional(),
    defaultUnitPrice: z.coerce.number().min(0).max(1000000000, 'Narx juda katta').optional(),
    isActive: z.boolean().default(true),
});

type ItemFormData = z.infer<typeof itemSchema>;

const ITEM_TYPES = [
    { value: 'INGREDIENT', label: 'Ingredient (Masalliq)' },
    { value: 'SUPPLY', label: 'Ta\'minot' },
    { value: 'CLEANING', label: 'Tozalash vositasi' },
    { value: 'PACKAGING', label: 'Qadoqlash' },
    { value: 'OTHER', label: 'Boshqa' },
];

const UNIT_TYPES = [
    { value: 'WEIGHT', label: 'Og\'irlik' },
    { value: 'VOLUME', label: 'Hajm' },
    { value: 'COUNT', label: 'Soni' },
];

const UNITS = {
    WEIGHT: [
        { value: 'kg', label: 'Kilogram (kg)' },
        { value: 'g', label: 'Gram (g)' },
    ],
    VOLUME: [
        { value: 'liter', label: 'Litr' },
        { value: 'ml', label: 'Millilitr (ml)' },
    ],
    COUNT: [{ value: 'piece', label: 'Dona' }],
};

const ITEM_TYPE_LABELS: Record<string, string> = {
    INGREDIENT: 'Ingredient',
    SUPPLY: 'Ta\'minot',
    CLEANING: 'Tozalash',
    PACKAGING: 'Qadoqlash',
    OTHER: 'Boshqa',
};

export function ItemsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data: itemsData, isLoading, isError, refetch } = useItems({ limit: 1000 });

    const createMutation = useCreateItem();
    const updateMutation = useUpdateItem();
    const deleteMutation = useDeleteItem();

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ItemFormData>({
        resolver: zodResolver(itemSchema),
        mode: 'onChange',
        defaultValues: {
            isActive: true,
            itemType: 'INGREDIENT',
            unitType: 'WEIGHT',
            unit: 'kg',
        },
    });

    const watchUnitType = watch('unitType');

    const onSubmit = (data: ItemFormData) => {
        if (editingItem) {
            updateMutation.mutate({ id: editingItem._id, data }, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setEditingItem(null);
                    reset();
                    toast.success('Mahsulot yangilandi');
                },
                onError: () => {
                    toast.error('Xatolik yuz berdi');
                }
            });
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                    toast.success('Mahsulot muvaffaqiyatli qo\'shildi');
                },
                onError: () => {
                    toast.error('Xatolik yuz berdi');
                }
            });
        }
    };

    const handleEdit = (item: Item) => {
        setEditingItem(item);
        reset({
            name: item.name,
            itemType: item.itemType,
            unitType: item.unitType,
            unit: item.unit,
            minStock: item.minStock ? fromBaseUnit(item.minStock, item.unit) : undefined,
            defaultUnitPrice: item.defaultUnitPrice ? fromBasePrice(item.defaultUnitPrice, item.unit) : undefined,
            isActive: item.isActive,
        });
        setIsDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        reset({
            name: '',
            itemType: 'INGREDIENT',
            unitType: 'WEIGHT',
            unit: 'kg',
            isActive: true,
        });
        setIsDialogOpen(true);
    };

    const columns: ColumnDef<Item>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Nomi
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-medium ml-4">{row.getValue("name")}</div>,
        },
        {
            accessorKey: 'itemType',
            header: 'Tur',
            cell: ({ row }) => ITEM_TYPE_LABELS[row.getValue("itemType") as string] || row.getValue("itemType"),
        },
        {
            accessorKey: 'unit',
            header: 'O\'lchov',
        },
        {
            accessorKey: 'minStock',
            header: 'Min. Qoldiq',
            cell: ({ row }) => {
                const val = row.getValue("minStock") as number | null;
                const unit = row.original.unit;
                return val ? formatQuantity(val, unit) : '-';
            }
        },
        {
            accessorKey: 'defaultUnitPrice',
            header: 'O\'rtacha narx',
            cell: ({ row }) => {
                const val = row.getValue("defaultUnitPrice") as number | null;
                const unit = row.original.unit;
                return val ? `${formatCurrency(fromBasePrice(val, unit))} / ${unit}` : '-';
            }
        },
        {
            accessorKey: 'isActive',
            header: 'Holat',
            cell: ({ row }) => {
                const isActive = row.getValue("isActive") as boolean;
                return (
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                        {isActive ? 'Faol' : 'Nofaol'}
                    </div>
                );
            }
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Amallar</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                                <Pencil className="mr-2 h-4 w-4" /> Tahrirlash
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setItemToDelete(item._id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> O'chirish
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: itemsData?.data || [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            pagination,
        },
    });

    if (isError) {
        return <ErrorState onRetry={() => refetch()} />;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Mahsulotlar</h1>
                    <p className="text-muted-foreground">Ombor zahiralarini boshqarish</p>
                </div>
                <Button onClick={handleAddNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Qo'shish
                </Button>
            </div>

            <div className="flex items-center py-4 gap-2">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Nomi bo'yicha qidirish..."
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("name")?.setFilterValue(event.target.value)
                        }
                        className="pl-8"
                    />
                </div>
                <Select
                    value={(table.getColumn("itemType")?.getFilterValue() as string) ?? "ALL"}
                    onValueChange={(value) => table.getColumn("itemType")?.setFilterValue(value === "ALL" ? undefined : value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Barcha turlar" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Barcha turlar</SelectItem>
                        {ITEM_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

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
                    Jami {table.getFilteredRowModel().rows.length} ta mahsulot
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

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Tahrirlash' : 'Yangi mahsulot qo\'shish'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nomi</Label>
                            <Input id="name" {...register('name')} />
                            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Mahsulot turi</Label>
                                <Select
                                    value={watch('itemType')}
                                    onValueChange={(v) => setValue('itemType', v as ItemFormData['itemType'])}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ITEM_TYPES.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>O'lchov turi</Label>
                                <Select
                                    value={watch('unitType')}
                                    onValueChange={(v) => {
                                        setValue('unitType', v as ItemFormData['unitType']);
                                        // Reset unit based on type
                                        const units = UNITS[v as keyof typeof UNITS];
                                        if (units.length > 0) {
                                            setValue('unit', units[0].value as ItemFormData['unit']);
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {UNIT_TYPES.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>O'lchov birligi</Label>
                            <Select
                                value={watch('unit')}
                                onValueChange={(v) => setValue('unit', v as ItemFormData['unit'])}
                                disabled={watchUnitType === 'COUNT'}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {UNITS[watchUnitType as keyof typeof UNITS]?.map((u) => (
                                        <SelectItem key={u.value} value={u.value}>
                                            {u.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="minStock">Min. qoldiq ({watch('unit')})</Label>
                                <Controller
                                    control={control}
                                    name="minStock"
                                    render={({ field: { onChange, value, ref } }) => (
                                        <MoneyInput
                                            id="minStock"
                                            value={value}
                                            onValueChange={(values) => onChange(values.floatValue)}
                                            getInputRef={ref}
                                            error={!!errors.minStock}
                                            max={1000000}
                                        />
                                    )}
                                />
                                {errors.minStock && <p className="text-sm text-destructive">{errors.minStock.message}</p>}
                                {watch('unit') && (watch('minStock') ?? 0) > 0 && (
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Saqlanadi: {formatQuantity(toBaseUnit(watch('minStock') || 0, watch('unit') || 'piece'), watch('unit') || 'piece')}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="defaultUnitPrice">O'rtacha narx ({watch('unit')})</Label>
                                <Controller
                                    control={control}
                                    name="defaultUnitPrice"
                                    render={({ field: { onChange, value, ref } }) => (
                                        <MoneyInput
                                            id="defaultUnitPrice"
                                            value={value}
                                            onValueChange={(values) => onChange(values.floatValue)}
                                            getInputRef={ref}
                                            error={!!errors.defaultUnitPrice}
                                            max={1000000000}
                                        />
                                    )}
                                />
                                {errors.defaultUnitPrice && <p className="text-sm text-destructive">{errors.defaultUnitPrice.message}</p>}
                                {watch('unit') && (watch('defaultUnitPrice') ?? 0) > 0 && (
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Saqlanadi: {formatCurrency(watch('defaultUnitPrice') || 0)}/{watch('unit')}
                                        {" => "}
                                        {formatCurrency(toBasePrice(watch('defaultUnitPrice') || 0, watch('unit') || 'piece'))}/{watch('unit') === 'kg' ? 'g' : watch('unit') === 'liter' ? 'ml' : 'dona'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Controller
                                control={control}
                                name="isActive"
                                render={({ field: { onChange, value } }) => (
                                    <Checkbox
                                        id="isActive"
                                        checked={value}
                                        onCheckedChange={onChange}
                                    />
                                )}
                            />
                            <Label htmlFor="isActive">Faol</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Bekor qilish
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                {editingItem ? 'Saqlash' : 'Yaratish'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!itemToDelete}
                onOpenChange={(open) => !open && setItemToDelete(null)}
                onConfirm={() => itemToDelete && deleteMutation.mutate(itemToDelete, {
                    onSuccess: () => {
                        setItemToDelete(null);
                        toast.success('Mahsulot o\'chirildi');
                    },
                    onError: () => {
                        toast.error('Xatolik yuz berdi');
                    }
                })}
                title="O'chirishni tasdiqlang"
                description="Haqiqatan ham bu mahsulotni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."
            />
        </div>
    );
}

export default ItemsPage;
