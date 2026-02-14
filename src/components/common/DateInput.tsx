import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface DateInputProps {
    /** Value in YYYY-MM-DD format */
    value?: string
    /** Callback with YYYY-MM-DD string */
    onChange: (value: string) => void
    /** HTML min date */
    min?: string
    /** HTML max date */
    max?: string
    disabled?: boolean
    className?: string
    id?: string
    /** Show error ring */
    error?: boolean
}

export function DateInput({
    value = '',
    onChange,
    min,
    max,
    disabled,
    className,
    id,
    error,
}: DateInputProps) {
    return (
        <Input
            type="date"
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={min}
            max={max}
            disabled={disabled}
            className={cn(
                'w-full',
                error && 'border-destructive focus-visible:ring-destructive',
                className,
            )}
        />
    )
}
