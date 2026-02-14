import * as React from "react"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { uz } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const UZ_WEEKDAYS = ["Ya", "Du", "Se", "Cho", "Pa", "Ju", "Sha"]

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            locale={uz}
            weekStartsOn={1}
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row gap-4",
                month: "space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-semibold",

                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",

                // MUHIM: table/row/cell larni bir xil o'lchamga keltiramiz
                table: "w-full border-collapse",
                head_row: "flex w-full gap-1",
                head_cell:
                    "w-10 shrink-0 text-center text-xs font-medium text-muted-foreground whitespace-nowrap",

                row: "flex w-full gap-1 mt-1",
                cell:
                    "w-10 h-10 shrink-0 p-0 text-center relative focus-within:z-20",

                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "w-10 h-10 p-0 font-normal text-sm aria-selected:opacity-100"
                ),

                day_range_end: "day-range-end",
                day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside:
                    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/40 aria-selected:text-muted-foreground aria-selected:opacity-40",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",

                ...classNames,
            }}
            formatters={{
                // Head bo'limni doim 2-3 harf qilib beramiz (Du/Se/Cho...)
                formatWeekdayName: (date) => UZ_WEEKDAYS[date.getDay()],
            }}
            components={{
                Chevron: ({ orientation, ...props }) => {
                    const Icon =
                        orientation === "left"
                            ? ChevronLeft
                            : orientation === "right"
                                ? ChevronRight
                                : orientation === "up"
                                    ? ChevronUp
                                    : ChevronDown
                    return <Icon className="h-4 w-4" {...props} />
                },
            }}
            {...props}
        />
    )
}

Calendar.displayName = "Calendar"
export { Calendar }
