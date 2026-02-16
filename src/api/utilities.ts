import { delay } from './mockUtils';
import { mockUtilities } from '../mocks/utilities';

// ── Types ────────────────────────────────────────────────────
export type UtilityType =
    | 'ELECTRICITY' | 'GAS' | 'WATER' | 'INTERNET'
    | 'RENT' | 'TRASH' | 'MAINTENANCE' | 'SECURITY' | 'OTHER';

export type UtilityUnit = 'kWh' | 'm3' | 'liter' | 'month' | 'fixed';

export interface UtilityTransaction {
    _id: string;
    date: string;
    utilityType: UtilityType;
    customTypeLabel: string | null;
    providerName: string | null;
    meterStart: number | null;
    meterEnd: number | null;
    consumption: number | null;
    unit: UtilityUnit;
    amount: number;
    note: string | null;
    createdAt: string;
}

export interface CreateUtilityRequest {
    date: string;
    utilityType: UtilityType;
    customTypeLabel?: string;
    providerName?: string;
    meterStart?: number | null;
    meterEnd?: number | null;
    consumption?: number | null;
    unit: UtilityUnit;
    amount: number;
    note?: string;
}

export interface UtilityQuery {
    from?: string;
    to?: string;
    utilityType?: UtilityType;
    limit?: number;
}

export interface UtilityTypeRule {
    allowedUnits: UtilityUnit[];
    defaultUnit: UtilityUnit;
    supportsMeter: boolean;
    meterRequired?: boolean;
    supportsConsumption?: boolean;
    providerSuggested?: boolean;
    requiresCustomLabel?: boolean;
}

// ── Constants ────────────────────────────────────────────────
export const UTILITY_TYPES: Array<{ value: UtilityType; label: string }> = [
    { value: 'ELECTRICITY', label: 'Elektr energiya' },
    { value: 'GAS', label: 'Gaz' },
    { value: 'WATER', label: 'Suv' },
    { value: 'INTERNET', label: 'Internet' },
    { value: 'RENT', label: 'Ijara' },
    { value: 'TRASH', label: 'Chiqit' },
    { value: 'MAINTENANCE', label: 'Bino xizmati' },
    { value: 'SECURITY', label: 'Qo\'riqlash' },
    { value: 'OTHER', label: 'Boshqa' },
];

export const UTILITY_UNITS: Array<{ value: UtilityUnit; label: string }> = [
    { value: 'kWh', label: 'kWh' },
    { value: 'm3', label: 'm³' },
    { value: 'liter', label: 'Litr' },
    { value: 'month', label: 'Oylik' },
    { value: 'fixed', label: 'Belgilangan' },
];

export const UTILITY_TYPE_RULES: Record<UtilityType, UtilityTypeRule> = {
    ELECTRICITY: { allowedUnits: ['kWh'], defaultUnit: 'kWh', supportsMeter: true, meterRequired: true, supportsConsumption: true, providerSuggested: true },
    GAS: { allowedUnits: ['m3'], defaultUnit: 'm3', supportsMeter: true, meterRequired: false, supportsConsumption: true, providerSuggested: true },
    WATER: { allowedUnits: ['m3', 'liter'], defaultUnit: 'm3', supportsMeter: true, meterRequired: false, supportsConsumption: true, providerSuggested: true },
    INTERNET: { allowedUnits: ['month', 'fixed'], defaultUnit: 'month', supportsMeter: false, meterRequired: false, supportsConsumption: false, providerSuggested: true },
    RENT: { allowedUnits: ['fixed', 'month'], defaultUnit: 'fixed', supportsMeter: false, meterRequired: false, supportsConsumption: false, providerSuggested: false },
    TRASH: { allowedUnits: ['month', 'fixed'], defaultUnit: 'month', supportsMeter: false, meterRequired: false, supportsConsumption: false, providerSuggested: false },
    MAINTENANCE: { allowedUnits: ['month', 'fixed'], defaultUnit: 'month', supportsMeter: false, meterRequired: false, supportsConsumption: false, providerSuggested: false },
    SECURITY: { allowedUnits: ['month', 'fixed'], defaultUnit: 'month', supportsMeter: false, meterRequired: false, supportsConsumption: false, providerSuggested: false },
    OTHER: { allowedUnits: ['fixed', 'month', 'kWh', 'm3', 'liter'], defaultUnit: 'fixed', supportsMeter: false, meterRequired: false, supportsConsumption: true, providerSuggested: true, requiresCustomLabel: true },
};

// ── Mock API (in-memory CRUD) ────────────────────────────────

let transactions = [...mockUtilities];

export const utilitiesApi = {
    getAll: async (query: UtilityQuery = {}) => {
        await delay(300);
        let filtered = [...transactions];

        if (query.utilityType) filtered = filtered.filter(t => t.utilityType === query.utilityType);
        if (query.from) filtered = filtered.filter(t => t.date >= query.from!);
        if (query.to) filtered = filtered.filter(t => t.date <= query.to!);

        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const totalAmount = filtered.reduce((s, t) => s + t.amount, 0);

        return {
            success: true,
            data: filtered,
            totalAmount,
            total: filtered.length,
        };
    },

    create: async (data: CreateUtilityRequest): Promise<{ success: boolean; data: UtilityTransaction }> => {
        await delay(300);
        const rule = UTILITY_TYPE_RULES[data.utilityType];
        const consumption =
            data.meterStart != null && data.meterEnd != null
                ? data.meterEnd - data.meterStart
                : data.consumption ?? null;

        const newTx: UtilityTransaction = {
            _id: Math.random().toString(36).substr(2, 9),
            date: data.date,
            utilityType: data.utilityType,
            customTypeLabel: rule.requiresCustomLabel ? (data.customTypeLabel || null) : null,
            providerName: data.providerName || null,
            meterStart: rule.supportsMeter ? (data.meterStart ?? null) : null,
            meterEnd: rule.supportsMeter ? (data.meterEnd ?? null) : null,
            consumption,
            unit: data.unit,
            amount: data.amount,
            note: data.note || null,
            createdAt: new Date().toISOString(),
        };
        transactions.unshift(newTx);
        return { success: true, data: newTx };
    },

    update: async (id: string, data: Partial<CreateUtilityRequest>): Promise<{ success: boolean; data: UtilityTransaction }> => {
        await delay(300);
        const idx = transactions.findIndex(t => t._id === id);
        if (idx === -1) throw new Error('Not found');
        transactions[idx] = { ...transactions[idx], ...data } as UtilityTransaction;
        return { success: true, data: transactions[idx] };
    },

    delete: async (id: string): Promise<void> => {
        await delay(200);
        transactions = transactions.filter(t => t._id !== id);
    },
};

export default utilitiesApi;
