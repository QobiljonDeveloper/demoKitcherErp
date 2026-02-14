import { Employee, SalaryPayment } from '../api/employees';

export const mockEmployees: Employee[] = [
    {
        _id: '101',
        fullName: 'Ali Valiyev',
        baseMonthlySalary: 3000000,
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
        _id: '102',
        fullName: 'Vali Aliyev',
        baseMonthlySalary: 2500000,
        isActive: true,
        createdAt: '2024-01-15T00:00:00.000Z',
    },
    {
        _id: '103',
        fullName: 'Gani Toshmatov',
        baseMonthlySalary: 4000000,
        isActive: true,
        createdAt: '2024-02-01T00:00:00.000Z',
    }
];

export const mockSalaries: SalaryPayment[] = [
    {
        _id: 's1',
        employeeId: { _id: '101', fullName: 'Ali Valiyev' },
        month: '2024-06',
        datePaid: '2024-07-05T10:00:00.000Z',
        amountPaid: 3200000,
        bonus: 200000,
        penalty: 0,
        note: 'Mukofot bilan',
        createdAt: '2024-07-05T10:00:00.000Z',
    },
    {
        _id: 's2',
        employeeId: { _id: '102', fullName: 'Vali Aliyev' },
        month: '2024-06',
        datePaid: '2024-07-05T11:00:00.000Z',
        amountPaid: 2400000,
        bonus: 0,
        penalty: 100000,
        note: 'Kechikkanligi uchun jarima',
        createdAt: '2024-07-05T11:00:00.000Z',
    }
];
