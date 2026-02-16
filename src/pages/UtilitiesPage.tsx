import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Pencil, Zap, Flame, Droplets, Wifi, Home } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

import { ConfirmDialog, ErrorState } from '@/components/common';
import type {
    UtilityTransaction,
    UtilityType,
    UtilityUnit,
    UtilityTypeRule,
} from '@/api/utilities';
import {
    UTILITY_TYPES,
    UTILITY_UNITS,
    UTILITY_TYPE_RULES,
} from '@/api/utilities';
import {
    useUtilities,
    useCreateUtility,
    useUpdateUtility,
    useDeleteUtility,
} from '@/hooks/queries/useUtilities';
import { formatCurrency } from '@/utils/unitConverter';

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function getRuleFor(type: UtilityType): UtilityTypeRule {
    return UTILITY_TYPE_RULES[type] ?? UTILITY_TYPE_RULES.OTHER;
}

function getTypeLabel(type: UtilityType, customLabel: string | null): string {
    if (type === 'OTHER') return customLabel || 'Boshqa';
    return UTILITY_TYPES.find((t) => t.value === type)?.label ?? type;
}

function getUnitLabel(unit: UtilityUnit): string {
    return UTILITY_UNITS.find((u) => u.value === unit)?.label ?? unit;
}

function getAllowedUnitOptions(rule: UtilityTypeRule) {
    return UTILITY_UNITS.filter((u) => rule.allowedUnits.includes(u.value));
}

// ═══════════════════════════════════════════════════════════════
//  ZOD SCHEMA
// ═══════════════════════════════════════════════════════════════

const utilityFormSchema = z.object({
    date: z.string().min(1, 'Sana kiritilishi shart'),
    utilityType: z.string().min(1, 'Tur tanlanishi shart'),
    customTypeLabel: z.string().optional().default(''),
    providerName: z.string().optional().default(''),
    meterStart: z.union([z.coerce.number().min(0), z.literal(''), z.null()]).optional(),
    meterEnd: z.union([z.coerce.number().min(0), z.literal(''), z.null()]).optional(),
    consumption: z.union([z.coerce.number().min(0), z.literal(''), z.null()]).optional(),
    unit: z.string().min(1, "O'lchov birligi tanlanishi shart"),
    amount: z.coerce.number().min(1, "Summa kamida 1 bo'lishi kerak").max(1_000_000_000, 'Summa juda katta'),
    note: z.string().optional().default(''),
});

type UtilityFormValues = z.infer<typeof utilityFormSchema>;

// ═══════════════════════════════════════════════════════════════
//  QUICK TEMPLATE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const QUICK_TEMPLATES: Array<{
    type: UtilityType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}> = [
        { type: 'ELECTRICITY', label: 'Svet (kWh)', icon: Zap, color: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/30' },
        { type: 'GAS', label: 'Gaz (m³)', icon: Flame, color: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/30' },
        { type: 'WATER', label: 'Suv (m³)', icon: Droplets, color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/30' },
        { type: 'INTERNET', label: 'Internet (oylik)', icon: Wifi, color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/30' },
        { type: 'RENT', label: 'Ijara', icon: Home, color: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/30' },
    ];

// ═══════════════════════════════════════════════════════════════
//  PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export function UtilitiesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [utilityToDelete, setUtilityToDelete] = useState<string | null>(null);

    const amountInputRef = useRef<HTMLInputElement>(null);

    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');
    const [filterType, setFilterType] = useState<string>('');

    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const queryParams = useMemo(() => ({
        from: filterFrom || undefined,
        to: filterTo || undefined,
        utilityType: (filterType || undefined) as UtilityType | undefined,
        limit: 1000,
    }), [filterFrom, filterTo, filterType]);

    const { data: utilitiesData, isLoading, isError, refetch } = useUtilities(queryParams);
    const createMutation = useCreateUtility();
    const updateMutation = useUpdateUtility();
    const deleteMutation = useDeleteUtility();

    // ══════════════════════════════════════════════════════════
    //  FORM
    // ══════════════════════════════════════════════════════════

    const form = useForm<UtilityFormValues>({
        resolver: zodResolver(utilityFormSchema),
        mode: 'onChange',
        defaultValues: {
            date: format(new Date(), 'yyyy-MM-dd'),
            utilityType: 'ELECTRICITY',
            customTypeLabel: '',
            providerName: '',
            meterStart: '',
            meterEnd: '',
            consumption: '',
            unit: 'kWh',
            amount: 0,
            note: '',
        },
    });

    const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = form;

    const watchType = watch('utilityType') as UtilityType;
    const watchUnit = watch('unit') as UtilityUnit;
    const watchMeterStart = watch('meterStart');
    const watchMeterEnd = watch('meterEnd');

    const currentRule = useMemo(() => getRuleFor(watchType), [watchType]);
    const allowedUnits = useMemo(() => getAllowedUnitOptions(currentRule), [currentRule]);
    const isSingleUnit = allowedUnits.length === 1;

    // ── Auto-set unit when type changes ──────────────────────
    const lastSyncedTypeRef = useRef<string>(watchType);

    useEffect(() => {
        if (watchType === lastSyncedTypeRef.current) return;
        lastSyncedTypeRef.current = watchType;

        const rule = getRuleFor(watchType);
        setValue('unit', rule.defaultUnit, { shouldValidate: true });

        if (!rule.supportsMeter) {
            setValue('meterStart', '', { shouldValidate: false });
            setValue('meterEnd', '', { shouldValidate: false });
        }
        if (!rule.supportsConsumption) {
            setValue('consumption', '', { shouldValidate: false });
        }
        if (!rule.requiresCustomLabel) {
            setValue('customTypeLabel', '', { shouldValidate: false });
        }
    }, [watchType, setValue]);

    // ── Force-sync single-unit types ─────────────────────────
    useEffect(() => {
        if (isSingleUnit && watchUnit !== allowedUnits[0].value) {
            setValue('unit', allowedUnits[0].value, { shouldValidate: true });
        }
    }, [isSingleUnit, watchUnit, allowedUnits, setValue]);

    // ── Derived consumption ──────────────────────────────────
    const meterStartNum = typeof watchMeterStart === 'number' ? watchMeterStart : null;
    const meterEndNum = typeof watchMeterEnd === 'number' ? watchMeterEnd : null;
    const hasBothMeters = meterStartNum != null && meterEndNum != null;
    const computedConsumption = hasBothMeters && meterEndNum >= meterStartNum
        ? meterEndNum - meterStartNum
        : null;

    useEffect(() => {
        setPagination((p) => ({ ...p, pageIndex: 0 }));
    }, [filterFrom, filterTo, filterType]);

    // ══════════════════════════════════════════════════════════
    //  SUBMIT
    // ══════════════════════════════════════════════════════════

    const onSubmit = useCallback((data: UtilityFormValues) => {
        const type = data.utilityType as UtilityType;
        const rule = getRuleFor(type);

        if (rule.requiresCustomLabel && !data.customTypeLabel?.trim()) {
            toast.error("Boshqa tur nomi kiritilishi shart");
            return;
        }
        if (rule.meterRequired) {
            const ms = typeof data.meterStart === 'number' ? data.meterStart : null;
            const me = typeof data.meterEnd === 'number' ? data.meterEnd : null;
            if (ms == null || me == null) {
                toast.error("Meter ko'rsatkichlari majburiy");
                return;
            }
            if (me < ms) {
                toast.error("Yakuniy ko'rsatkich boshlanishidan kichik bo'lishi mumkin emas");
                return;
            }
        }

        const payload: Record<string, unknown> = {
            date: data.date,
            utilityType: type,
            unit: data.unit,
            amount: data.amount,
            note: data.note?.trim() || undefined,
        };

        if (rule.requiresCustomLabel) payload.customTypeLabel = data.customTypeLabel?.trim();
        if (data.providerName?.trim()) payload.providerName = data.providerName.trim();

        if (rule.supportsMeter) {
            const ms = typeof data.meterStart === 'number' ? data.meterStart : null;
            const me = typeof data.meterEnd === 'number' ? data.meterEnd : null;
            payload.meterStart = ms;
            payload.meterEnd = me;
            if (ms != null && me != null) {
                payload.consumption = null;
            } else if (rule.supportsConsumption) {
                payload.consumption = typeof data.consumption === 'number' ? data.consumption : null;
            } else {
                payload.consumption = null;
            }
        } else {
            payload.meterStart = null;
            payload.meterEnd = null;
            payload.consumption = rule.supportsConsumption && typeof data.consumption === 'number'
                ? data.consumption
                : null;
        }

        if (editingId) {
            updateMutation.mutate(
                { id: editingId, data: payload as any },
                {
                    onSuccess: () => {
                        setIsDialogOpen(false);
                        setEditingId(null);
                        reset();
                        toast.success("Kommunal to'lov yangilandi");
                    },
                    onError: () => toast.error('Xatolik yuz berdi'),
                },
            );
        } else {
            createMutation.mutate(payload as any, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                    toast.success("Kommunal to'lov qo'shildi");
                },
                onError: () => toast.error('Xatolik yuz berdi'),
            });
        }
    }, [editingId, createMutation, updateMutation, reset]);

    // ══════════════════════════════════════════════════════════
    //  DIALOG OPEN HANDLERS
    // ══════════════════════════════════════════════════════════

    const openNewForm = useCallback((type: UtilityType = 'ELECTRICITY') => {
        const rule = getRuleFor(type);
        setEditingId(null);
        lastSyncedTypeRef.current = type;
        reset({
            date: format(new Date(), 'yyyy-MM-dd'),
            utilityType: type,
            customTypeLabel: '',
            providerName: '',
            meterStart: '',
            meterEnd: '',
            consumption: '',
            unit: rule.defaultUnit,
            amount: 0,
            note: '',
        });
        setIsDialogOpen(true);
        requestAnimationFrame(() => {
            setTimeout(() => amountInputRef.current?.focus(), 50);
        });
    }, [reset]);

    const handleAddNew = useCallback(() => openNewForm('ELECTRICITY'), [openNewForm]);
    const handleQuickTemplate = useCallback((type: UtilityType) => openNewForm(type), [openNewForm]);

    const handleEdit = useCallback((row: UtilityTransaction) => {
        setEditingId(row._id);
        lastSyncedTypeRef.current = row.utilityType;
        reset({
            date: row.date?.split('T')[0] || format(new Date(), 'yyyy-MM-dd'),
            utilityType: row.utilityType,
            customTypeLabel: row.customTypeLabel || '',
            providerName: row.providerName || '',
            meterStart: row.meterStart ?? '',
            meterEnd: row.meterEnd ?? '',
            consumption: row.consumption ?? '',
            unit: row.unit,
            amount: row.amount,
            note: row.note || '',
        });
        setIsDialogOpen(true);
    }, [reset]);

    const handleDeleteClick = useCallback((id: string) => setUtilityToDelete(id), []);

    // ══════════════════════════════════════════════════════════
    //  TABLE COLUMNS
    // ══════════════════════════════════════════════════════════

    const columns = useMemo<ColumnDef<UtilityTransaction>[]>(
        () => [
            {
                accessorKey: 'date',
                header: 'Sana',
                cell: ({ row }) => format(new Date(row.getValue('date')), 'dd.MM.yyyy'),
            },
            {
                id: 'type',
                header: 'Tur',
                cell: ({ row }) => (
                    <div className="font-medium">
                        {getTypeLabel(row.original.utilityType, row.original.customTypeLabel)}
                    </div>
                ),
            },
            {
                accessorKey: 'providerName',
                header: 'Provayder',
                cell: ({ row }) => row.getValue('providerName') || '—',
            },
            {
                accessorKey: 'consumption',
                header: "Iste'mol",
                cell: ({ row }) => {
                    const val = row.getValue('consumption') as number | null;
                    return val != null
                        ? `${val} ${getUnitLabel(row.original.unit)}`
                        : '—';
                },
            },
            {
                accessorKey: 'amount',
                header: 'Summa',
                cell: ({ row }) => (
                    <div className="font-bold">{formatCurrency(row.getValue('amount'))}</div>
                ),
            },
            {
                accessorKey: 'note',
                header: 'Izoh',
                cell: ({ row }) => (
                    <div className="max-w-[150px] truncate" title={row.getValue('note') || ''}>
                        {row.getValue('note') || '—'}
                    </div>
                ),
            },
            {
                id: 'actions',
                cell: ({ row }) => (
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(row.original)} aria-label="Tahrirlash">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteClick(row.original._id)} aria-label="O'chirish">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ),
            },
        ],
        [handleEdit, handleDeleteClick],
    );

    const tableData = useMemo(() => utilitiesData?.data || [], [utilitiesData?.data]);
    const totalAmount = utilitiesData?.totalAmount || 0;

    const table = useReactTable({
        data: tableData,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onPaginationChange: setPagination,
        autoResetPageIndex: false,
        state: { sorting, pagination },
    });

    if (isError) {
        return <ErrorState onRetry={() => refetch()} />;
    }

    // ══════════════════════════════════════════════════════════
    //  RENDER
    // ══════════════════════════════════════════════════════════

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Kommunal to'lovlar</h1>
                    <p className="text-muted-foreground">
                        Barcha kommunal xarajatlar — elektr, gaz, suv, internet va boshqalar
                    </p>
                </div>
                <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Qo'shish
                </Button>
            </div>

            {/* Quick Templates */}
            <div className="flex flex-wrap gap-2">
                {QUICK_TEMPLATES.map((tpl) => {
                    const Icon = tpl.icon;
                    return (
                        <Button
                            key={tpl.type}
                            variant="outline"
                            size="sm"
                            className={`${tpl.color} border`}
                            onClick={() => handleQuickTemplate(tpl.type)}
                        >
                            <Icon className="h-4 w-4 mr-1.5" />
                            {tpl.label}
                        </Button>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1">
                    <Label className="text-xs" htmlFor="filter-from">Boshlanish</Label>
                    <Input id="filter-from" type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="w-[160px]" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs" htmlFor="filter-to">Tugash</Label>
                    <Input id="filter-to" type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="w-[160px]" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs" htmlFor="filter-type">Tur</Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger id="filter-type" className="w-[180px]">
                            <SelectValue placeholder="Barchasi" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Barchasi</SelectItem>
                            {UTILITY_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {(filterFrom || filterTo || filterType) && (
                    <Button variant="ghost" size="sm" onClick={() => { setFilterFrom(''); setFilterTo(''); setFilterType(''); }}>
                        Tozalash
                    </Button>
                )}
            </div>

            {/* Summary Card */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Jami kommunal xarajat (filtrlangan)</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-8 w-32" /> : (
                        <p className="text-2xl font-bold text-orange-500">{formatCurrency(totalAmount)}</p>
                    )}
                </CardContent>
            </Card>

            {/* Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((h) => (
                                    <TableHead key={h.id}>
                                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
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
                                    {isLoading ? 'Yuklanmoqda...' : "Ma'lumotlar topilmadi"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Jami {table.getFilteredRowModel().rows.length} ta to'lov
                </div>
                <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Oldingi</Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Keyingi</Button>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                 CREATE / EDIT DIALOG
                ═══════════════════════════════════════════════════ */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? "Kommunal to'lovni tahrirlash" : "Kommunal to'lov qo'shish"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Date + Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="util-date">Sana *</Label>
                                <Controller control={control} name="date" render={({ field }) => (
                                    <Input id="util-date" type="date" value={field.value} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} />
                                )} />
                                {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="util-type">Tur *</Label>
                                <Controller control={control} name="utilityType" render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id="util-type" ref={field.ref} onBlur={field.onBlur}>
                                            <SelectValue placeholder="Turni tanlang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {UTILITY_TYPES.map((t) => (
                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )} />
                                {errors.utilityType && <p className="text-sm text-destructive">{errors.utilityType.message}</p>}
                            </div>
                        </div>

                        {/* Custom type label (OTHER) */}
                        {currentRule.requiresCustomLabel && (
                            <div className="space-y-2">
                                <Label htmlFor="util-custom-label">Boshqa tur nomi *</Label>
                                <Controller control={control} name="customTypeLabel" render={({ field }) => (
                                    <Input id="util-custom-label" value={field.value || ''} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} placeholder="Masalan: Parking, Lift, Domkom..." />
                                )} />
                                {errors.customTypeLabel && <p className="text-sm text-destructive">{errors.customTypeLabel.message}</p>}
                            </div>
                        )}

                        {/* Provider */}
                        {currentRule.providerSuggested && (
                            <div className="space-y-2">
                                <Label htmlFor="util-provider">Provayder / Kompaniya</Label>
                                <Controller control={control} name="providerName" render={({ field }) => (
                                    <Input id="util-provider" value={field.value || ''} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} placeholder="Masalan: UzbekEnergo, Hududgaz..." />
                                )} />
                            </div>
                        )}

                        {/* Unit */}
                        <div className="space-y-2">
                            <Label htmlFor="util-unit">O'lchov birligi *</Label>
                            {isSingleUnit ? (
                                <Input id="util-unit" value={allowedUnits[0].label} readOnly tabIndex={-1} className="bg-muted cursor-default" aria-label={`O'lchov birligi: ${allowedUnits[0].label}`} />
                            ) : (
                                <Controller control={control} name="unit" render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id="util-unit" ref={field.ref} onBlur={field.onBlur}>
                                            <SelectValue placeholder="Birlikni tanlang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allowedUnits.map((u) => (
                                                <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )} />
                            )}
                            {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
                        </div>

                        {/* Meters */}
                        {currentRule.supportsMeter && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="util-meter-start">
                                            Boshlang'ich ko'rsatkich{currentRule.meterRequired ? ' *' : ''}
                                        </Label>
                                        <Controller control={control} name="meterStart" render={({ field }) => (
                                            <Input
                                                id="util-meter-start" type="number" min="0" step="any"
                                                value={field.value === '' || field.value == null ? '' : field.value}
                                                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                                onBlur={field.onBlur} ref={field.ref}
                                                placeholder={currentRule.meterRequired ? 'Majburiy' : 'Ixtiyoriy'}
                                            />
                                        )} />
                                        {errors.meterStart && <p className="text-sm text-destructive">{errors.meterStart.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="util-meter-end">
                                            Yakuniy ko'rsatkich{currentRule.meterRequired ? ' *' : ''}
                                        </Label>
                                        <Controller control={control} name="meterEnd" render={({ field }) => (
                                            <Input
                                                id="util-meter-end" type="number" min="0" step="any"
                                                value={field.value === '' || field.value == null ? '' : field.value}
                                                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                                onBlur={field.onBlur} ref={field.ref}
                                                placeholder={currentRule.meterRequired ? 'Majburiy' : 'Ixtiyoriy'}
                                            />
                                        )} />
                                        {errors.meterEnd && <p className="text-sm text-destructive">{errors.meterEnd.message}</p>}
                                    </div>
                                </div>
                                {currentRule.meterRequired && (
                                    <p className="text-xs text-muted-foreground -mt-2">
                                        {getTypeLabel(watchType, null)} uchun meter ko'rsatkichlari majburiy
                                    </p>
                                )}
                            </>
                        )}

                        {/* Consumption */}
                        {currentRule.supportsConsumption && (
                            <div className="space-y-2">
                                <Label htmlFor="util-consumption">Iste'mol miqdori</Label>
                                {hasBothMeters ? (
                                    <div className="flex items-center gap-2">
                                        <Input id="util-consumption" type="number" value={computedConsumption ?? ''} readOnly tabIndex={-1} className="bg-muted cursor-default" />
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">Avto-hisoblangan</span>
                                    </div>
                                ) : (
                                    <Controller control={control} name="consumption" render={({ field }) => (
                                        <Input
                                            id="util-consumption" type="number" min="0" step="any"
                                            value={field.value === '' || field.value == null ? '' : field.value}
                                            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                            onBlur={field.onBlur} ref={field.ref} placeholder="Ixtiyoriy"
                                        />
                                    )} />
                                )}
                            </div>
                        )}

                        {/* Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="util-amount">To'langan summa (UZS) *</Label>
                            <Controller control={control} name="amount" render={({ field }) => (
                                <MoneyInput
                                    id="util-amount"
                                    value={field.value}
                                    onValueChange={(values) => field.onChange(values.floatValue)}
                                    getInputRef={(el: HTMLInputElement | null) => {
                                        if (typeof field.ref === 'function') field.ref(el);
                                        (amountInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                                    }}
                                    error={!!errors.amount}
                                    max={1_000_000_000}
                                />
                            )} />
                            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                        </div>

                        {/* Note */}
                        <div className="space-y-2">
                            <Label htmlFor="util-note">Izoh</Label>
                            <Controller control={control} name="note" render={({ field }) => (
                                <Textarea id="util-note" value={field.value || ''} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} placeholder="Qo'shimcha izoh..." className="resize-none" rows={2} />
                            )} />
                        </div>

                        {/* Actions */}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Bekor qilish
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                {(createMutation.isPending || updateMutation.isPending)
                                    ? 'Saqlanmoqda...'
                                    : editingId ? 'Saqlash' : "Qo'shish"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete */}
            <ConfirmDialog
                open={!!utilityToDelete}
                onOpenChange={(open) => !open && setUtilityToDelete(null)}
                onConfirm={() =>
                    utilityToDelete &&
                    deleteMutation.mutate(utilityToDelete, {
                        onSuccess: () => {
                            setUtilityToDelete(null);
                            toast.success("Kommunal to'lov o'chirildi");
                        },
                        onError: () => toast.error('Xatolik yuz berdi'),
                    })
                }
                title="O'chirishni tasdiqlang"
                description="Ushbu kommunal to'lovni o'chirmoqchimisiz? Bog'liq kassa harakati ham o'chiriladi."
            />
        </div>
    );
}

export default UtilitiesPage;
