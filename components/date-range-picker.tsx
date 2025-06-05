"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { TimeRange } from "@/types/finance"

// Importieren wir useFinance, um auf den Lohntag zuzugreifen
import { useFinance } from "@/context/finance-context"

interface DateRangePickerProps {
  timeRange: TimeRange
  onChange: (range: TimeRange) => void
  className?: string
}

// In der DateRangePicker-Komponente fügen wir eine neue Funktion hinzu
export function DateRangePicker({ timeRange, onChange, className }: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange>({
    from: timeRange.startDate,
    to: timeRange.endDate,
  })

  const { data, updateTimeRangeBasedOnPayday } = useFinance()
  const paydayOfMonth = data.settings.paydayOfMonth

  // Update the date when timeRange changes
  React.useEffect(() => {
    setDate({
      from: timeRange.startDate,
      to: timeRange.endDate,
    })
  }, [timeRange])

  // Predefined date ranges
  const today = new Date()

  // Aktualisieren wir die vordefinierten Zeiträume
  const setCurrentMonth = () => {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    onChange({ startDate: startOfMonth, endDate: endOfMonth })
  }

  const setPreviousMonth = () => {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth(), 0)
    onChange({ startDate: startOfMonth, endDate: endOfMonth })
  }

  const setCurrentYear = () => {
    const startOfYear = new Date(today.getFullYear(), 0, 1)
    const endOfYear = new Date(today.getFullYear(), 11, 31)
    onChange({ startDate: startOfYear, endDate: endOfYear })
  }

  // Neue Funktion für die aktuelle Lohnperiode
  const setCurrentPayPeriod = () => {
    updateTimeRangeBasedOnPayday()
  }

  // Neue Funktion für die vorherige Lohnperiode
  const setPreviousPayPeriod = () => {
    const currentDay = today.getDate()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    let startDate: Date
    let endDate: Date

    // Wenn der aktuelle Tag vor dem Lohntag liegt
    if (currentDay < paydayOfMonth) {
      // Vorherige Periode beginnt zwei Monate zurück am Lohntag
      startDate = new Date(currentYear, currentMonth - 2, paydayOfMonth)
      // Vorherige Periode endet einen Monat zurück am Tag vor dem Lohntag
      endDate = new Date(currentYear, currentMonth - 1, paydayOfMonth - 1)
    } else {
      // Vorherige Periode beginnt einen Monat zurück am Lohntag
      startDate = new Date(currentYear, currentMonth - 1, paydayOfMonth)
      // Vorherige Periode endet am Tag vor dem Lohntag des aktuellen Monats
      endDate = new Date(currentYear, currentMonth, paydayOfMonth - 1)
    }

    onChange({ startDate, endDate })
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd.MM.yyyy", { locale: de })} - {format(date.to, "dd.MM.yyyy", { locale: de })}
                </>
              ) : (
                format(date.from, "dd.MM.yyyy", { locale: de })
              )
            ) : (
              <span>Zeitraum wählen</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <div className="flex gap-2 justify-between flex-wrap">
              <Button variant="outline" size="sm" onClick={setCurrentPayPeriod}>
                Aktuelle Lohnperiode
              </Button>
              <Button variant="outline" size="sm" onClick={setPreviousPayPeriod}>
                Vorherige Lohnperiode
              </Button>
              <Button variant="outline" size="sm" onClick={setCurrentMonth}>
                Aktueller Monat
              </Button>
              <Button variant="outline" size="sm" onClick={setPreviousMonth}>
                Vormonat
              </Button>
              <Button variant="outline" size="sm" onClick={setCurrentYear}>
                Dieses Jahr
              </Button>
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(selectedDate) => {
              setDate(selectedDate || { from: undefined, to: undefined })
              if (selectedDate?.from && selectedDate?.to) {
                onChange({
                  startDate: selectedDate.from,
                  endDate: selectedDate.to,
                })
              }
            }}
            numberOfMonths={2}
            locale={de}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
