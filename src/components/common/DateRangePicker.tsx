import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { uz as uzLocale } from 'date-fns/locale'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
    date?: DateRange
    setDate: (date?: DateRange) => void
    className?: string
}

export function DateRangePicker({
    date,
    setDate,
    className,
}: DateRangePickerProps) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y", { locale: uzLocale })} -{" "}
                                    {format(date.to, "LLL dd, y", { locale: uzLocale })}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y", { locale: uzLocale })
                            )
                        ) : (
                            <span>Muddatni tanlang</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        locale={uzLocale}
                    />
                    <div className="p-3 border-t">
                        <Button
                            variant="ghost"
                            className="w-full h-8 text-sm"
                            onClick={() => setDate(undefined)}
                        >
                            Tozalash
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
