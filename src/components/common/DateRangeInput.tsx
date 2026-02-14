import * as React from 'react'
import { Label } from '@/components/ui/label'
import { DateInput } from './DateInput'

interface DateRangeInputProps {
    from?: string
    to?: string
    onFromChange: (value: string) => void
    onToChange: (value: string) => void
    disabled?: boolean
    className?: string
}

export function DateRangeInput({
    from = '',
    to = '',
    onFromChange,
    onToChange,
    disabled,
    className,
}: DateRangeInputProps) {
    return (
        <div className={`flex items-end gap-2 ${className || ''}`}>
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Boshlanish sana</Label>
                <DateInput
                    value={from}
                    onChange={onFromChange}
                    max={to || undefined}
                    disabled={disabled}
                />
            </div>
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Tugash sana</Label>
                <DateInput
                    value={to}
                    onChange={onToChange}
                    min={from || undefined}
                    disabled={disabled}
                />
            </div>
        </div>
    )
}
