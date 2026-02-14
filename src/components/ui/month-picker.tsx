import * as React from "react"
import { format, setMonth, setYear } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { uz as uzLocale } from 'date-fns/locale'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MonthPickerProps {
    date?: Date;
    setDate: (date: Date) => void;
    className?: string;
}

export function MonthPicker({ date, setDate, className }: MonthPickerProps) {
    const [selectedDate, setSelectedDate] = React.useState<Date>(date || new Date())
    const [year, setYearState] = React.useState<string>(selectedDate.getFullYear().toString())
    const [month, setMonthState] = React.useState<string>(selectedDate.getMonth().toString())

    React.useEffect(() => {
        if (date) {
            setSelectedDate(date)
            setYearState(date.getFullYear().toString())
            setMonthState(date.getMonth().toString())
        }
    }, [date])

    const handleMonthChange = (newMonth: string) => {
        const newDate = setMonth(selectedDate, parseInt(newMonth))
        setMonthState(newMonth)
        setSelectedDate(newDate)
        setDate(newDate)
    }

    const handleYearChange = (newYear: string) => {
        const newDate = setYear(selectedDate, parseInt(newYear))
        setYearState(newYear)
        setSelectedDate(newDate)
        setDate(newDate)
    }

    const months = [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
        "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
    ]

    const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i).toString())

    return (
        <div className={cn("flex gap-2", className)}>
            <Select value={month} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Oy" />
                </SelectTrigger>
                <SelectContent>
                    {months.map((m, i) => (
                        <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={year} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Yil" />
                </SelectTrigger>
                <SelectContent>
                    {years.map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
