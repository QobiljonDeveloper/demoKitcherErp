import React from 'react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface MoneyInputProps extends Omit<NumericFormatProps, 'customInput'> {
    className?: string;
    error?: boolean;
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <NumericFormat
                {...props}
                getInputRef={ref}
                customInput={Input}
                thousandSeparator=" "
                allowNegative={false}
                className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
            />
        );
    }
);

MoneyInput.displayName = 'MoneyInput';
