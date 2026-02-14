import { Item } from '../api/items';

export const mockItems: Item[] = [
    {
        _id: '1',
        name: 'Sigir go\'shti (Laq)',
        itemType: 'INGREDIENT',
        unitType: 'WEIGHT',
        unit: 'kg',
        minStock: 10000, // 10 kg
        defaultUnitPrice: 85, // 85 UZS per gram (85,000 per kg)
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        _id: '2',
        name: 'Guruch (Lazer)',
        itemType: 'INGREDIENT',
        unitType: 'WEIGHT',
        unit: 'kg',
        minStock: 50000, // 50 kg
        defaultUnitPrice: 18, // 18 UZS per gram (18,000 per kg)
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        _id: '3',
        name: 'Piyoz',
        itemType: 'INGREDIENT',
        unitType: 'WEIGHT',
        unit: 'kg',
        minStock: 20000, // 20 kg
        defaultUnitPrice: 3, // 3,000 per kg
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        _id: '4',
        name: 'Sabzi',
        itemType: 'INGREDIENT',
        unitType: 'WEIGHT',
        unit: 'kg',
        minStock: 30000, // 30 kg
        defaultUnitPrice: 2.5, // 2,500 per kg
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        _id: '5',
        name: 'Paxta yog\'i',
        itemType: 'INGREDIENT',
        unitType: 'VOLUME',
        unit: 'liter',
        minStock: 20000, // 20 liter
        defaultUnitPrice: 14, // 14,000 per liter
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        _id: '6',
        name: 'Konteyner (Katta)',
        itemType: 'PACKAGING',
        unitType: 'COUNT',
        unit: 'piece',
        minStock: 100,
        defaultUnitPrice: 1200,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        _id: '7',
        name: 'Salfetka',
        itemType: 'SUPPLY',
        unitType: 'COUNT',
        unit: 'piece',
        minStock: 200,
        defaultUnitPrice: 50,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        _id: '8',
        name: 'Feyri',
        itemType: 'CLEANING',
        unitType: 'COUNT',
        unit: 'piece',
        minStock: 5,
        defaultUnitPrice: 15000,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];
