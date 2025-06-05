"use client"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart } from "@/components/charts/line-chart"
import { format, subMonths } from "date-fns"
import { de } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function IncomeExpenseChart() {
  const { getMonthlyIncomeTrend, getMonthlyExpenseTrend } = useFinance()
  const [timeRange, setTimeRange] = useState<number>(6) // Default: 6 Monate

  // Generiere Daten für die letzten X Monate
  const generateMonthlyData = (months: number) => {
    const today = new Date()
    const incomeData = []
    const expenseData = []

    // Hole die Trend-Daten
    const incomeTrend = getMonthlyIncomeTrend()
    const expenseTrend = getMonthlyExpenseTrend()

    // Beschränke auf die angegebene Anzahl von Monaten
    const limitedIncomeTrend = incomeTrend.slice(-months)
    const limitedExpenseTrend = expenseTrend.slice(-months)

    // Wenn weniger als die angeforderten Monate verfügbar sind, fülle mit Nullen auf
    if (limitedIncomeTrend.length < months) {
      const missingMonths = months - limitedIncomeTrend.length
      for (let i = 0; i < missingMonths; i++) {
        const date = subMonths(today, months - i - 1)
        const monthName = format(date, "MMM", { locale: de })
        incomeData.push({ label: monthName, value: 0 })
        expenseData.push({ label: monthName, value: 0 })
      }
    }

    // Füge die vorhandenen Daten hinzu
    limitedIncomeTrend.forEach((item) => {
      incomeData.push({ label: item.month, value: item.amount })
    })

    limitedExpenseTrend.forEach((item) => {
      expenseData.push({ label: item.month, value: item.amount })
    })

    return { incomeData, expenseData }
  }

  const { incomeData, expenseData } = generateMonthlyData(timeRange)

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Einnahmen vs. Ausgaben ({timeRange} Monate)</CardTitle>
        <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(Number.parseInt(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Zeitraum wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 Monate</SelectItem>
            <SelectItem value="6">6 Monate</SelectItem>
            <SelectItem value="12">12 Monate</SelectItem>
            <SelectItem value="24">24 Monate</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <LineChart incomeData={incomeData} expenseData={expenseData} />
        </div>
      </CardContent>
    </Card>
  )
}
