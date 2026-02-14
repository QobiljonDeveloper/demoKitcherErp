// Unit conversion utilities

export const UNIT_CONVERSIONS = {
    kg: { base: 'g', factor: 1000 },
    g: { base: 'g', factor: 1 },
    liter: { base: 'ml', factor: 1000 },
    ml: { base: 'ml', factor: 1 },
    piece: { base: 'piece', factor: 1 },
};

// Helper function to convert quantity to base unit (integer)
export function toBaseUnit(value: number, unit: string): number {
    const conversion = UNIT_CONVERSIONS[unit as keyof typeof UNIT_CONVERSIONS];
    if (!conversion) return Math.round(value);
    return Math.round(value * conversion.factor);
}

// Helper function to convert from base unit to display unit
export function fromBaseUnit(baseValue: number, unit: string): number {
    const conversion = UNIT_CONVERSIONS[unit as keyof typeof UNIT_CONVERSIONS];
    if (!conversion) return baseValue;
    return baseValue / conversion.factor;
}

// Helper function to convert price per unit to price per base unit (UZS integer)
export function toBasePrice(pricePerUnit: number, unit: string): number {
    const conversion = UNIT_CONVERSIONS[unit as keyof typeof UNIT_CONVERSIONS];
    if (!conversion) return Math.round(pricePerUnit);
    return Math.round(pricePerUnit / conversion.factor);
}

// Helper function to convert price per base unit to price per display unit
export function fromBasePrice(pricePerBase: number, unit: string): number {
    const conversion = UNIT_CONVERSIONS[unit as keyof typeof UNIT_CONVERSIONS];
    if (!conversion) return pricePerBase;
    return pricePerBase * conversion.factor;
}

export function formatQuantity(baseValue: number, unit: string): string {
    const displayValue = fromBaseUnit(baseValue, unit);
    // Format to 3 decimal places if it's kg/liter and has decimals
    const formatted = displayValue.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3
    });
    return `${formatted} ${unit}`;
}

export function formatCurrency(value: number): string {
    return value.toLocaleString() + ' UZS';
}
