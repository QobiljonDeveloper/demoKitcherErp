import { useState, useMemo, useCallback, useEffect } from 'react';
import { format, parse } from 'date-fns';

import {
    Plus,
    Trash2,
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import { MonthPicker } from '@/components/ui/month-picker';


import { ConfirmDialog, EmptyState, ErrorState } from '@/components/common';
import { SalaryPayment, Employee } from '@/api/employees';
import { useSalaries, useCreateSalary, useDeleteSalary, useSalaryStats } from '@/hooks/queries/useSalaries';
import { useActiveEmployees } from '@/hooks/queries/useEmployees';
import { formatCurrency } from '@/utils/unitConverter';

const salarySchema = z.object({
    employeeId: z.string().min(1, 'Xodim tanlanishi shart'),
    month: z.string().min(1, 'Oy tanlanishi shart'),
    datePaid: z.string().min(1, 'To\'lov sanasi kiritilishi shart'),
    amountPaid: z.coerce.number().min(1, 'Summa kamida 1 bo\'lishi kerak').max(1000000000, 'Summa juda katta'),
    bonus: z.coerce.number().min(0).max(1000000000, 'Summa juda katta').default(0),
    penalty: z.coerce.number().min(0).max(1000000000, 'Summa juda katta').default(0),
    note: z.string().optional(),
});

type SalaryFormData = z.infer<typeof salarySchema>;

export function SalariesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [salaryToDelete, setSalaryToDelete] = useState<string | null>(null);

    // Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    // Reset pagination when month changes
    useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, [selectedMonth]);

    const { data: salariesData, isLoading: isSalariesLoading, isError, refetch } = useSalaries({
        month: selectedMonth,
        limit: 1000
    });

    const { data: statsData, isLoading: isStatsLoading } = useSalaryStats(selectedMonth);

    const { data: employeesData } = useActiveEmployees();

    const createMutation = useCreateSalary();
    const deleteMutation = useDeleteSalary();

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<SalaryFormData>({
        resolver: zodResolver(salarySchema),
        mode: 'onChange',
        defaultValues: {
            month: format(new Date(), 'yyyy-MM'),
            datePaid: format(new Date(), 'yyyy-MM-dd'),
            bonus: 0,
            penalty: 0,
        },
    });

    const onSubmit = (data: SalaryFormData) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                setIsDialogOpen(false);
                reset();
                toast.success('Maosh to\'lovi qo\'shildi');
            },
            onError: () => {
                toast.error('Xatolik yuz berdi');
            }
        });
    };

    const handleAddNew = () => {
        reset({
            employeeId: '',
            month: selectedMonth,
            datePaid: format(new Date(), 'yyyy-MM-dd'),
            amountPaid: 0,
            bonus: 0,
            penalty: 0,
            note: '',
        });
        setIsDialogOpen(true);
    };

    const handleDelete = useCallback((id: string) => {
        setSalaryToDelete(id);
    }, []);

    const columns = useMemo<ColumnDef<SalaryPayment>[]>(() => [
        {
            accessorKey: 'datePaid',
            header: 'Sana',
            cell: ({ row }) => {
                const date = new Date(row.getValue("datePaid"));
                return <div className="ml-4">{format(date, 'dd.MM.yyyy')}</div>;
            }
        },
        {
            accessorFn: (row) => row.employeeId?.fullName || 'O\'chirilgan',
            id: 'employeeName',
            header: 'Xodim',
            cell: ({ row }) => <div className="font-medium">{row.original.employeeId?.fullName || 'O\'chirilgan'}</div>,
        },
        {
            accessorKey: 'amountPaid',
            header: 'To\'langan summa',
            cell: ({ row }) => {
                const amount = row.getValue("amountPaid") as number;
                return <div className="font-bold">{formatCurrency(amount)}</div>;
            }
        },
        {
            accessorKey: 'bonus',
            header: 'Bonus',
            cell: ({ row }) => {
                const amount = row.getValue("bonus") as number;
                return amount > 0 ? <span className="text-green-600">+{formatCurrency(amount)}</span> : '-';
            }
        },
        {
            accessorKey: 'penalty',
            header: 'Jarima',
            cell: ({ row }) => {
                const amount = row.getValue("penalty") as number;
                return amount > 0 ? <span className="text-red-600">-{formatCurrency(amount)}</span> : '-';
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
                        onClick={() => handleDelete(row.original._id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                );
            },
        },
    ], [handleDelete]);

    const tableData = useMemo(() => salariesData?.data || [], [salariesData?.data]);

    const table = useReactTable({
        data: tableData,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onPaginationChange: setPagination,
        autoResetPageIndex: false,
        state: {
            sorting,
            pagination,
        },
    });

    const activeEmployees = employeesData?.data || [];
    const stats = statsData?.data;

    if (isError) {
        return <ErrorState onRetry={() => refetch()} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Maoshlar</h1>
                    <p className="text-muted-foreground">Xodimlarga to'lovlar tarixi</p>
                </div>
                <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    To'lov qo'shish
                </Button>
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-2">
                <Label className="mr-2">Oy bo'yicha saralash:</Label>
                <MonthPicker
                    date={parse(selectedMonth, 'yyyy-MM', new Date())}
                    setDate={(date) => {
                        setSelectedMonth(format(date, 'yyyy-MM'));
                        setPagination(p => ({ ...p, pageIndex: 0 }));
                    }}
                />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Jami to'langan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isStatsLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <p className="text-2xl font-bold">{formatCurrency(stats?.totalPaid || 0)}</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Jami bonus</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isStatsLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <p className="text-2xl font-bold text-green-500">{formatCurrency(stats?.totalBonus || 0)}</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Jami jarima</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isStatsLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <p className="text-2xl font-bold text-red-500">{formatCurrency(stats?.totalPenalty || 0)}</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">To'lovlar soni</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isStatsLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <p className="text-2xl font-bold">{stats?.paymentsCount || 0}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border bg-card" key={selectedMonth}>
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
                                    {isSalariesLoading ? 'Yuklanmoqda...' : 'Ma\'lumotlar topilmadi'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Jami {table.getFilteredRowModel().rows.length} ta to'lov
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Maosh to'lovini qo'shish</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Xodim</Label>
                            <Select
                                value={watch('employeeId')}
                                onValueChange={(v) => setValue('employeeId', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Xodimni tanlang" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeEmployees.map((emp: Employee) => (
                                        <SelectItem key={emp._id} value={emp._id}>
                                            {emp.fullName} ({formatCurrency(emp.baseMonthlySalary)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.employeeId && <p className="text-sm text-destructive">{errors.employeeId.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="month">Oy</Label>
                                <Controller
                                    control={control}
                                    name="month"
                                    render={({ field: { value, onChange } }) => (
                                        <Input
                                            type="month"
                                            value={value}
                                            onChange={onChange}
                                            className="w-full block"
                                        />
                                    )}
                                />
                                {errors.month && <p className="text-sm text-destructive">{errors.month.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="datePaid">To'lov sanasi</Label>
                                <Controller
                                    control={control}
                                    name="datePaid"
                                    render={({ field: { value, onChange } }) => (
                                        <Input
                                            type="date"
                                            value={value}
                                            onChange={onChange}
                                            className="w-full block"
                                        />
                                    )}
                                />
                                {errors.datePaid && <p className="text-sm text-destructive">{errors.datePaid.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amountPaid">To'langan summa (UZS)</Label>
                            <Controller
                                control={control}
                                name="amountPaid"
                                render={({ field: { onChange, value, ref } }) => (
                                    <MoneyInput
                                        id="amountPaid"
                                        value={value}
                                        onValueChange={(values) => onChange(values.floatValue)}
                                        getInputRef={ref}
                                        error={!!errors.amountPaid}
                                        max={1000000000}
                                    />
                                )}
                            />
                            {errors.amountPaid && <p className="text-sm text-destructive">{errors.amountPaid.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bonus">Bonus</Label>
                                <Controller
                                    control={control}
                                    name="bonus"
                                    render={({ field: { onChange, value, ref } }) => (
                                        <MoneyInput
                                            id="bonus"
                                            value={value}
                                            onValueChange={(values) => onChange(values.floatValue)}
                                            getInputRef={ref}
                                            error={!!errors.bonus}
                                            max={1000000000}
                                        />
                                    )}
                                />
                                {errors.bonus && <p className="text-sm text-destructive">{errors.bonus.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="penalty">Jarima</Label>
                                <Controller
                                    control={control}
                                    name="penalty"
                                    render={({ field: { onChange, value, ref } }) => (
                                        <MoneyInput
                                            id="penalty"
                                            value={value}
                                            onValueChange={(values) => onChange(values.floatValue)}
                                            getInputRef={ref}
                                            error={!!errors.penalty}
                                            max={1000000000}
                                        />
                                    )}
                                />
                                {errors.penalty && <p className="text-sm text-destructive">{errors.penalty.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="note">Izoh</Label>
                            <Input id="note" {...register('note')} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Bekor qilish
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                To'lov qo'shish
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!salaryToDelete}
                onOpenChange={(open) => !open && setSalaryToDelete(null)}
                onConfirm={() => salaryToDelete && deleteMutation.mutate(salaryToDelete, {
                    onSuccess: () => {
                        setSalaryToDelete(null);
                        toast.success('Maosh to\'lovi o\'chirildi');
                    },
                    onError: () => {
                        toast.error('Xatolik yuz berdi');
                    }
                })}
                title="O'chirishni tasdiqlang"
                description="Ushbu to'lovni o'chirmoqchimisiz?"
            />
        </div>
    );
}

export default SalariesPage;
