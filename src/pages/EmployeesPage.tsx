import { useState, useMemo } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    Search,
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
import { Checkbox } from '@/components/ui/checkbox';
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

import { ConfirmDialog, EmptyState, ErrorState } from '@/components/common';
import { Employee } from '@/api/employees';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '@/hooks/queries/useEmployees';
import { formatCurrency } from '@/utils/unitConverter';

const employeeSchema = z.object({
    fullName: z.string().min(2, 'Ism kiritilishi shart'),
    baseMonthlySalary: z.coerce.number().min(0, 'Maosh musbat bo\'lishi kerak').max(1000000000, 'Maosh juda katta'),
    isActive: z.boolean().default(true),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export function EmployeesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

    // Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data: employeesData, isLoading, isError, refetch } = useEmployees({ limit: 1000 });

    const createMutation = useCreateEmployee();
    const updateMutation = useUpdateEmployee();
    const deleteMutation = useDeleteEmployee();

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EmployeeFormData>({
        resolver: zodResolver(employeeSchema),
        mode: 'onChange',
        defaultValues: {
            isActive: true,
        },
    });

    const onSubmit = (data: EmployeeFormData) => {
        if (editingEmployee) {
            updateMutation.mutate({ id: editingEmployee._id, data }, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setEditingEmployee(null);
                    reset();
                    toast.success('Xodim ma\'lumotlari yangilandi');
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
                    toast.success('Xodim muvaffaqiyatli qo\'shildi');
                },
                onError: () => {
                    toast.error('Xatolik yuz berdi');
                }
            });
        }
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        reset({
            fullName: employee.fullName,
            baseMonthlySalary: employee.baseMonthlySalary,
            isActive: employee.isActive,
        });
        setIsDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingEmployee(null);
        reset({
            fullName: '',
            baseMonthlySalary: 0,
            isActive: true,
        });
        setIsDialogOpen(true);
    };

    const columns: ColumnDef<Employee>[] = [
        {
            accessorKey: 'fullName',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        F.I.O
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-medium ml-4">{row.getValue("fullName")}</div>,
        },
        {
            accessorKey: 'baseMonthlySalary',
            header: 'Oylik Maosh',
            cell: ({ row }) => {
                const amount = row.getValue("baseMonthlySalary") as number;
                return <div className="font-medium">{formatCurrency(amount)}</div>;
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
                const employee = row.original;
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
                            <DropdownMenuItem onClick={() => handleEdit(employee)}>
                                <Pencil className="mr-2 h-4 w-4" /> Tahrirlash
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEmployeeToDelete(employee._id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> O'chirish
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: employeesData?.data || [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
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
                    <h1 className="text-3xl font-bold">Xodimlar</h1>
                    <p className="text-muted-foreground">Jamoani boshqarish</p>
                </div>
                <Button onClick={handleAddNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Xodim qo'shish
                </Button>
            </div>

            <div className="flex items-center py-4">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Ism bo'yicha qidirish..."
                        value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("fullName")?.setFilterValue(event.target.value)
                        }
                        className="pl-8"
                    />
                </div>
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
                    Jami {table.getFilteredRowModel().rows.length} ta xodim
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
                        <DialogTitle>{editingEmployee ? 'Xodimni tahrirlash' : 'Yangi xodim qo\'shish'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">F.I.O</Label>
                            <Input id="fullName" {...register('fullName')} />
                            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="baseMonthlySalary">Oylik maosh (UZS)</Label>
                            <Controller
                                control={control}
                                name="baseMonthlySalary"
                                render={({ field: { onChange, value, ref } }) => (
                                    <MoneyInput
                                        id="baseMonthlySalary"
                                        value={value}
                                        onValueChange={(values) => onChange(values.floatValue)}
                                        getInputRef={ref}
                                        error={!!errors.baseMonthlySalary}
                                        max={1000000000}
                                    />
                                )}
                            />
                            {errors.baseMonthlySalary && <p className="text-sm text-destructive">{errors.baseMonthlySalary.message}</p>}
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
                                {editingEmployee ? 'Saqlash' : 'Yaratish'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!employeeToDelete}
                onOpenChange={(open) => !open && setEmployeeToDelete(null)}
                onConfirm={() => employeeToDelete && deleteMutation.mutate(employeeToDelete, {
                    onSuccess: () => {
                        setEmployeeToDelete(null);
                        toast.success('Xodim o\'chirildi');
                    },
                    onError: () => {
                        toast.error('Xatolik yuz berdi');
                    }
                })}
                title="O'chirishni tasdiqlang"
                description="Haqiqatan ham bu xodimni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."
            />
        </div>
    );
}

export default EmployeesPage;
