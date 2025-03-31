import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-[#1e1e2f] border-2 border-[#7f5af0]/40 rounded-lg shadow-lg calendar", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center text-[#d4af37]",
        caption_label: "text-sm font-medium text-[#d4af37]",
        nav: "space-x-1 flex items-center calendar-nav",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 border-[#7f5af0]/40 text-[#d4af37]"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-[#d4af37] rounded-md w-9 font-normal text-[0.8rem] calendar-head-cell",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative calendar-cell [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-[#7f5af0]/20 [&:has([aria-selected])]:bg-[#7f5af0]/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 calendar-day text-[#f5f5f5] hover:bg-[#7f5af0]/20 hover:text-[#f5f5f5]"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-[#7f5af0] text-white hover:bg-[#7f5af0]/90 hover:text-white focus:bg-[#7f5af0] focus:text-white",
        day_today: "bg-[#d4af37]/20 text-[#d4af37] font-bold border border-[#d4af37]/40",
        day_outside:
          "day-outside text-[#f5f5f5]/40 opacity-50 aria-selected:bg-[#7f5af0]/30 aria-selected:text-[#f5f5f5]/70 aria-selected:opacity-40",
        day_disabled: "text-[#f5f5f5]/30 opacity-50",
        day_range_middle:
          "aria-selected:bg-[#7f5af0]/20 aria-selected:text-[#f5f5f5]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
