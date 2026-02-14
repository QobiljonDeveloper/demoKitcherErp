import { delay } from './mockUtils';
import { mockEmployees, mockSalaries } from '../mocks/employees';

export interface Employee {
    _id: string;
    fullName: string;
    baseMonthlySalary: number;
    isActive: boolean;
    createdAt: string;
}

export interface SalaryPayment {
    _id: string;
    employeeId: {
        _id: string;
        fullName: string;
    };
    month: string;
    datePaid: string;
    amountPaid: number;
    bonus: number;
    penalty: number;
    note: string | null;
    createdAt: string;
}

export interface CreateEmployeeRequest {
    fullName: string;
    baseMonthlySalary: number;
    isActive?: boolean;
}

export interface CreateSalaryRequest {
    employeeId: string;
    month: string;
    datePaid: string;
    amountPaid: number;
    bonus?: number;
    penalty?: number;
    note?: string;
}

let employees = [...mockEmployees];
let salaries = [...mockSalaries];

export const employeesApi = {
    getAll: async (query: { page?: number; limit?: number; isActive?: boolean; search?: string } = {}) => {
        await delay(400);
        let filtered = employees;
        if (query.isActive !== undefined) {
            filtered = filtered.filter(e => e.isActive === query.isActive);
        }
        if (query.search) {
            const lower = query.search.toLowerCase();
            filtered = filtered.filter(e => e.fullName.toLowerCase().includes(lower));
        }

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const start = (page - 1) * limit;
        const end = start + limit;

        return {
            success: true,
            data: filtered.slice(start, end),
            total: filtered.length,
            page,
            limit,
            totalPages: Math.ceil(filtered.length / limit)
        };
    },

    getActive: async (): Promise<{ success: boolean; data: Employee[] }> => {
        await delay(300);
        return { success: true, data: employees.filter(e => e.isActive) };
    },

    create: async (data: CreateEmployeeRequest): Promise<{ success: boolean; data: Employee }> => {
        await delay(400);
        const newEmp: Employee = {
            _id: Math.random().toString(36).substr(2, 9),
            ...data,
            isActive: data.isActive ?? true,
            createdAt: new Date().toISOString()
        };
        employees.unshift(newEmp);
        return { success: true, data: newEmp };
    },

    update: async (id: string, data: Partial<CreateEmployeeRequest>): Promise<{ success: boolean; data: Employee }> => {
        await delay(400);
        const idx = employees.findIndex(e => e._id === id);
        if (idx === -1) throw new Error('Not found');
        employees[idx] = { ...employees[idx], ...data };
        return { success: true, data: employees[idx] };
    },

    delete: async (id: string): Promise<void> => {
        await delay(300);
        employees = employees.filter(e => e._id !== id);
    },
};

export interface SalaryStats {
    month: string;
    totalPaid: number;
    totalBonus: number;
    totalPenalty: number;
    paymentsCount: number;
}

export const salariesApi = {
    getAll: async (query: { page?: number; limit?: number; month?: string; employeeId?: string } = {}) => {
        await delay(400);
        let filtered = salaries;
        if (query.month) filtered = filtered.filter(s => s.month === query.month);
        if (query.employeeId) filtered = filtered.filter(s => s.employeeId._id === query.employeeId);

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const start = (page - 1) * limit;
        const end = start + limit;

        return {
            success: true,
            data: filtered.slice(start, end),
            total: filtered.length,
            page,
            limit,
            totalPages: Math.ceil(filtered.length / limit)
        };
    },

    getMonthlyStats: async (month: string): Promise<{ success: boolean; data: SalaryStats }> => {
        await delay(300);
        const monthly = salaries.filter(s => s.month === month);
        const totalPaid = monthly.reduce((acc, curr) => acc + curr.amountPaid, 0);
        const totalBonus = monthly.reduce((acc, curr) => acc + (curr.bonus || 0), 0);
        const totalPenalty = monthly.reduce((acc, curr) => acc + (curr.penalty || 0), 0);

        return {
            success: true,
            data: {
                month,
                totalPaid,
                totalBonus,
                totalPenalty,
                paymentsCount: monthly.length
            }
        };
    },

    create: async (data: CreateSalaryRequest): Promise<{ success: boolean; data: SalaryPayment }> => {
        await delay(400);
        const emp = employees.find(e => e._id === data.employeeId);
        const newSal: SalaryPayment = {
            _id: Math.random().toString(36).substr(2, 9),
            employeeId: { _id: data.employeeId, fullName: emp ? emp.fullName : 'Unknown' },
            month: data.month,
            datePaid: data.datePaid,
            amountPaid: data.amountPaid,
            bonus: data.bonus || 0,
            penalty: data.penalty || 0,
            note: data.note || null,
            createdAt: new Date().toISOString()
        };
        salaries.unshift(newSal);
        return { success: true, data: newSal };
    },

    update: async (id: string, data: Partial<CreateSalaryRequest>): Promise<{ success: boolean; data: SalaryPayment }> => {
        await delay(400);
        const idx = salaries.findIndex(s => s._id === id);
        if (idx === -1) throw new Error('Not found');
        // Updating nested employee ref if needed would be complex, skipping for simplicty
        salaries[idx] = { ...salaries[idx], ...data } as any;
        return { success: true, data: salaries[idx] };
    },

    delete: async (id: string): Promise<void> => {
        await delay(300);
        salaries = salaries.filter(s => s._id !== id);
    },
};
