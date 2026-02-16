import { Employee, SalaryPayment } from '../api/employees';

export const mockEmployees: Employee[] = [
    { _id: '101', fullName: 'Ali Valiyev', baseMonthlySalary: 3_000_000, isActive: true, createdAt: '2024-01-01T00:00:00.000Z' },
    { _id: '102', fullName: 'Vali Aliyev', baseMonthlySalary: 2_500_000, isActive: true, createdAt: '2024-01-15T00:00:00.000Z' },
    { _id: '103', fullName: 'Gani Toshmatov', baseMonthlySalary: 4_000_000, isActive: true, createdAt: '2024-02-01T00:00:00.000Z' },
    { _id: '104', fullName: 'Dilshod Karimov', baseMonthlySalary: 3_500_000, isActive: true, createdAt: '2024-03-10T00:00:00.000Z' },
    { _id: '105', fullName: 'Nodira Xasanova', baseMonthlySalary: 2_800_000, isActive: true, createdAt: '2024-04-01T00:00:00.000Z' },
    { _id: '106', fullName: 'Sardor Umarov', baseMonthlySalary: 3_200_000, isActive: true, createdAt: '2024-05-15T00:00:00.000Z' },
    { _id: '107', fullName: 'Madina Rahimova', baseMonthlySalary: 2_200_000, isActive: true, createdAt: '2024-06-01T00:00:00.000Z' },
    { _id: '108', fullName: 'Jasur Mirzayev', baseMonthlySalary: 1_800_000, isActive: false, createdAt: '2024-01-01T00:00:00.000Z' },
];

// ─── Helper ──────────────────────────────────────────────────
function sal(
    id: string,
    empId: string,
    empName: string,
    month: string,
    day: string,
    amountPaid: number,
    bonus: number,
    penalty: number,
    note: string | null,
): SalaryPayment {
    return {
        _id: id,
        employeeId: { _id: empId, fullName: empName },
        month,
        datePaid: `${day}T10:00:00.000Z`,
        amountPaid,
        bonus,
        penalty,
        note,
        createdAt: `${day}T10:00:00.000Z`,
    };
}

export const mockSalaries: SalaryPayment[] = [
    // ═══════════════════════════════════════════
    //  2026-02  (current month — 7 payments)
    // ═══════════════════════════════════════════
    sal('s01', '101', 'Ali Valiyev', '2026-02', '2026-02-05', 3_200_000, 200_000, 0, 'Mukofot — oy natijalari yaxshi'),
    sal('s02', '102', 'Vali Aliyev', '2026-02', '2026-02-05', 2_500_000, 0, 100_000, 'Kechikkanligi uchun jarima'),
    sal('s03', '103', 'Gani Toshmatov', '2026-02', '2026-02-06', 4_000_000, 500_000, 0, 'Bonus — yuqori savdo'),
    sal('s04', '104', 'Dilshod Karimov', '2026-02', '2026-02-06', 3_500_000, 0, 0, null),
    sal('s05', '105', 'Nodira Xasanova', '2026-02', '2026-02-07', 2_800_000, 300_000, 0, 'Kecha smena uchun qo\'shimcha'),
    sal('s06', '106', 'Sardor Umarov', '2026-02', '2026-02-07', 3_200_000, 0, 150_000, 'Inventarizatsiya kamchiligi'),
    sal('s07', '107', 'Madina Rahimova', '2026-02', '2026-02-08', 2_200_000, 0, 0, null),

    // ═══════════════════════════════════════════
    //  2026-01  (previous month — 14 payments)
    // ═══════════════════════════════════════════
    sal('s08', '101', 'Ali Valiyev', '2026-01', '2026-01-05', 3_000_000, 0, 0, null),
    sal('s09', '102', 'Vali Aliyev', '2026-01', '2026-01-05', 2_500_000, 0, 0, null),
    sal('s10', '103', 'Gani Toshmatov', '2026-01', '2026-01-06', 4_000_000, 300_000, 0, 'Bonus — yangi yil'),
    sal('s11', '104', 'Dilshod Karimov', '2026-01', '2026-01-06', 3_500_000, 0, 200_000, 'Ishga kelmadi 2 kun'),
    sal('s12', '105', 'Nodira Xasanova', '2026-01', '2026-01-07', 2_800_000, 0, 0, null),
    sal('s13', '106', 'Sardor Umarov', '2026-01', '2026-01-07', 3_200_000, 200_000, 0, 'Yaxshi natija'),
    sal('s14', '107', 'Madina Rahimova', '2026-01', '2026-01-08', 2_200_000, 0, 0, null),
    // Avans — mid-month advance payments
    sal('s15', '101', 'Ali Valiyev', '2026-01', '2026-01-15', 1_500_000, 0, 0, 'Avans'),
    sal('s16', '103', 'Gani Toshmatov', '2026-01', '2026-01-15', 2_000_000, 0, 0, 'Avans'),
    sal('s17', '104', 'Dilshod Karimov', '2026-01', '2026-01-16', 1_500_000, 0, 0, 'Avans'),
    sal('s18', '105', 'Nodira Xasanova', '2026-01', '2026-01-16', 1_400_000, 0, 0, 'Avans'),
    sal('s19', '106', 'Sardor Umarov', '2026-01', '2026-01-17', 1_600_000, 0, 0, 'Avans'),
    sal('s20', '102', 'Vali Aliyev', '2026-01', '2026-01-17', 1_200_000, 0, 0, 'Avans'),
    sal('s21', '107', 'Madina Rahimova', '2026-01', '2026-01-18', 1_100_000, 0, 0, 'Avans'),

    // ═══════════════════════════════════════════
    //  2025-12  (13 payments)
    // ═══════════════════════════════════════════
    sal('s22', '101', 'Ali Valiyev', '2025-12', '2025-12-05', 3_000_000, 500_000, 0, 'Yillik bonus'),
    sal('s23', '102', 'Vali Aliyev', '2025-12', '2025-12-05', 2_500_000, 400_000, 0, 'Yillik bonus'),
    sal('s24', '103', 'Gani Toshmatov', '2025-12', '2025-12-06', 4_000_000, 800_000, 0, 'Yillik bonus'),
    sal('s25', '104', 'Dilshod Karimov', '2025-12', '2025-12-06', 3_500_000, 300_000, 0, null),
    sal('s26', '105', 'Nodira Xasanova', '2025-12', '2025-12-07', 2_800_000, 250_000, 0, null),
    sal('s27', '106', 'Sardor Umarov', '2025-12', '2025-12-07', 3_200_000, 0, 300_000, 'Kassa kamchiligi'),
    sal('s28', '107', 'Madina Rahimova', '2025-12', '2025-12-08', 2_200_000, 200_000, 0, null),
    sal('s29', '101', 'Ali Valiyev', '2025-12', '2025-12-15', 1_500_000, 0, 0, 'Avans'),
    sal('s30', '102', 'Vali Aliyev', '2025-12', '2025-12-15', 1_200_000, 0, 0, 'Avans'),
    sal('s31', '103', 'Gani Toshmatov', '2025-12', '2025-12-16', 2_000_000, 0, 0, 'Avans'),
    sal('s32', '104', 'Dilshod Karimov', '2025-12', '2025-12-16', 1_800_000, 0, 0, 'Avans'),
    sal('s33', '105', 'Nodira Xasanova', '2025-12', '2025-12-17', 1_400_000, 0, 0, 'Avans'),
    sal('s34', '106', 'Sardor Umarov', '2025-12', '2025-12-17', 1_600_000, 0, 0, 'Avans'),

    // ═══════════════════════════════════════════
    //  2025-11  (7 payments)
    // ═══════════════════════════════════════════
    sal('s35', '101', 'Ali Valiyev', '2025-11', '2025-11-05', 3_000_000, 0, 0, null),
    sal('s36', '102', 'Vali Aliyev', '2025-11', '2025-11-05', 2_500_000, 0, 50_000, 'Ozgina kechikish'),
    sal('s37', '103', 'Gani Toshmatov', '2025-11', '2025-11-06', 4_000_000, 0, 0, null),
    sal('s38', '104', 'Dilshod Karimov', '2025-11', '2025-11-06', 3_500_000, 150_000, 0, 'Qo\'shimcha ish'),
    sal('s39', '105', 'Nodira Xasanova', '2025-11', '2025-11-07', 2_800_000, 0, 0, null),
    sal('s40', '106', 'Sardor Umarov', '2025-11', '2025-11-07', 3_200_000, 0, 0, null),
    sal('s41', '107', 'Madina Rahimova', '2025-11', '2025-11-08', 2_200_000, 100_000, 0, 'Bayram uchun mukofot'),

    // ═══════════════════════════════════════════
    //  2025-10  (7 payments)
    // ═══════════════════════════════════════════
    sal('s42', '101', 'Ali Valiyev', '2025-10', '2025-10-05', 3_000_000, 0, 0, null),
    sal('s43', '102', 'Vali Aliyev', '2025-10', '2025-10-05', 2_500_000, 200_000, 0, 'Yaxshi ish'),
    sal('s44', '103', 'Gani Toshmatov', '2025-10', '2025-10-06', 4_000_000, 0, 0, null),
    sal('s45', '104', 'Dilshod Karimov', '2025-10', '2025-10-06', 3_500_000, 0, 100_000, 'Kechikish'),
    sal('s46', '105', 'Nodira Xasanova', '2025-10', '2025-10-07', 2_800_000, 0, 0, null),
    sal('s47', '106', 'Sardor Umarov', '2025-10', '2025-10-07', 3_200_000, 0, 0, null),
    sal('s48', '107', 'Madina Rahimova', '2025-10', '2025-10-08', 2_200_000, 0, 0, null),
];
