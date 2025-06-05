"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFinance } from "@/context/finance-context"
import { format, addMonths, isBefore, isAfter, isSameDay } from "date-fns"
import { ArrowUpFromLine, ArrowDownToLine, Package, Download } from "lucide-react"

export function Forecast() {
  const { data, formatCurrency } = useFinance()
  const [forecastMonths, setForecastMonths] = useState(3)
  const [forecastData, setForecastData] = useState([])
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  })
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Berechne die Prognose, wenn sich die Daten ändern
  useEffect(() => {
    if (!data) {
      setIsLoading(true)
      return
    }

    try {
      setIsLoading(true)

      // Erstelle eine Prognose basierend auf wiederkehrenden Transaktionen und zukünftigen Ausgaben
      const today = new Date()
      const endDate = addMonths(today, forecastMonths)

      const forecast = []
      let totalIncome = 0
      let totalExpense = 0

      // Füge wiederkehrende Einnahmen hinzu
      if (data.incomes && data.incomes.length > 0) {
        data.incomes
          .filter((income) => income.isRecurring)
          .forEach((income) => {
            const amount = Number.parseFloat(income.amount) || 0

            // Berechne die nächsten Ausführungen basierend auf dem Intervall
            let nextDate = new Date(income.date ? income.date : today)

            // Überspringe vergangene Daten
            while (isBefore(nextDate, today) && !isSameDay(nextDate, today)) {
              // Nächstes Datum basierend auf Intervall berechnen
              if (income.recurringInterval === "weekly") {
                nextDate.setDate(nextDate.getDate() + 7)
              } else if (income.recurringInterval === "biweekly") {
                nextDate.setDate(nextDate.getDate() + 14)
              } else if (income.recurringInterval === "monthly") {
                nextDate.setMonth(nextDate.getMonth() + 1)
              } else if (income.recurringInterval === "quarterly") {
                nextDate.setMonth(nextDate.getMonth() + 3)
              } else if (income.recurringInterval === "yearly") {
                nextDate.setFullYear(nextDate.getFullYear() + 1)
              } else {
                // Standardmäßig monatlich
                nextDate.setMonth(nextDate.getMonth() + 1)
              }
            }

            // Füge alle zukünftigen Ausführungen innerhalb des Prognosezeitraums hinzu
            while (isBefore(nextDate, endDate) || isSameDay(nextDate, endDate)) {
              const currentAmount = amount
              totalIncome += currentAmount

              forecast.push({
                id: `income-${income.id}-${nextDate.getTime()}`,
                type: "income",
                description: income.description || "Wiederkehrende Einnahme",
                amount: currentAmount,
                date: new Date(nextDate),
                category: income.categoryId
                  ? data.categories.find((c) => c.id === income.categoryId)?.name || "Allgemein"
                  : "Allgemein",
                isRecurring: true,
              })

              // Nächstes Datum berechnen
              if (income.recurringInterval === "weekly") {
                nextDate = new Date(nextDate.setDate(nextDate.getDate() + 7))
              } else if (income.recurringInterval === "biweekly") {
                nextDate = new Date(nextDate.setDate(nextDate.getDate() + 14))
              } else if (income.recurringInterval === "monthly") {
                nextDate = new Date(nextDate.setMonth(nextDate.getMonth() + 1))
              } else if (income.recurringInterval === "quarterly") {
                nextDate = new Date(nextDate.setMonth(nextDate.getMonth() + 3))
              } else if (income.recurringInterval === "yearly") {
                nextDate = new Date(nextDate.setFullYear(nextDate.getFullYear() + 1))
              } else {
                // Standardmäßig monatlich
                nextDate = new Date(nextDate.setMonth(nextDate.getMonth() + 1))
              }
            }
          })
      }

      // Füge wiederkehrende Ausgaben hinzu
      if (data.expenses && data.expenses.length > 0) {
        data.expenses
          .filter((expense) => expense.isRecurring)
          .forEach((expense) => {
            const amount = Number.parseFloat(expense.amount) || 0

            // Berechne die nächsten Ausführungen basierend auf dem Intervall
            let nextDate = new Date(expense.date ? expense.date : today)

            // Überspringe vergangene Daten
            while (isBefore(nextDate, today) && !isSameDay(nextDate, today)) {
              // Nächstes Datum basierend auf Intervall berechnen
              if (expense.recurringInterval === "weekly") {
                nextDate.setDate(nextDate.getDate() + 7)
              } else if (expense.recurringInterval === "biweekly") {
                nextDate.setDate(nextDate.getDate() + 14)
              } else if (expense.recurringInterval === "monthly") {
                nextDate.setMonth(nextDate.getMonth() + 1)
              } else if (expense.recurringInterval === "quarterly") {
                nextDate.setMonth(nextDate.getMonth() + 3)
              } else if (expense.recurringInterval === "yearly") {
                nextDate.setFullYear(nextDate.getFullYear() + 1)
              } else {
                // Standardmäßig monatlich
                nextDate.setMonth(nextDate.getMonth() + 1)
              }
            }

            // Füge alle zukünftigen Ausführungen innerhalb des Prognosezeitraums hinzu
            while (isBefore(nextDate, endDate) || isSameDay(nextDate, endDate)) {
              const currentAmount = amount
              totalExpense += currentAmount

              forecast.push({
                id: `expense-${expense.id}-${nextDate.getTime()}`,
                type: "expense",
                description: expense.description || "Wiederkehrende Ausgabe",
                amount: currentAmount,
                date: new Date(nextDate),
                category: expense.categoryId
                  ? data.categories.find((c) => c.id === expense.categoryId)?.name || "Allgemein"
                  : "Allgemein",
                isRecurring: true,
              })

              // Nächstes Datum berechnen
              if (expense.recurringInterval === "weekly") {
                nextDate = new Date(nextDate.setDate(nextDate.getDate() + 7))
              } else if (expense.recurringInterval === "biweekly") {
                nextDate = new Date(nextDate.setDate(nextDate.getDate() + 14))
              } else if (expense.recurringInterval === "monthly") {
                nextDate = new Date(nextDate.setMonth(nextDate.getMonth() + 1))
              } else if (expense.recurringInterval === "quarterly") {
                nextDate = new Date(nextDate.setMonth(nextDate.getMonth() + 3))
              } else if (expense.recurringInterval === "yearly") {
                nextDate = new Date(nextDate.setFullYear(nextDate.getFullYear() + 1))
              } else {
                // Standardmäßig monatlich
                nextDate = new Date(nextDate.setMonth(nextDate.getMonth() + 1))
              }
            }
          })
      }

      // Füge einmalige zukünftige Ausgaben hinzu
      if (data.expenses && data.expenses.length > 0) {
        data.expenses
          .filter((expense) => !expense.isRecurring && expense.date)
          .forEach((expense) => {
            try {
              const expenseDate = new Date(expense.date)

              // Prüfe, ob die Ausgabe in der Zukunft liegt und innerhalb des Prognosezeitraums
              if (
                (isAfter(expenseDate, today) || isSameDay(expenseDate, today)) &&
                (isBefore(expenseDate, endDate) || isSameDay(expenseDate, endDate))
              ) {
                const amount = Number.parseFloat(expense.amount) || 0
                totalExpense += amount

                forecast.push({
                  id: `expense-single-${expense.id}`,
                  type: "expense",
                  description: expense.description || "Einmalige Ausgabe",
                  amount: amount,
                  date: expenseDate,
                  category: expense.categoryId
                    ? data.categories.find((c) => c.id === expense.categoryId)?.name || "Allgemein"
                    : "Allgemein",
                  isRecurring: false,
                })
              }
            } catch (error) {
              console.error("Fehler beim Verarbeiten einer einmaligen Ausgabe:", error)
            }
          })
      }

      // Füge einmalige zukünftige Einnahmen hinzu
      if (data.incomes && data.incomes.length > 0) {
        data.incomes
          .filter((income) => !income.isRecurring && income.date)
          .forEach((income) => {
            try {
              const incomeDate = new Date(income.date)

              // Prüfe, ob die Einnahme in der Zukunft liegt und innerhalb des Prognosezeitraums
              if (
                (isAfter(incomeDate, today) || isSameDay(incomeDate, today)) &&
                (isBefore(incomeDate, endDate) || isSameDay(incomeDate, endDate))
              ) {
                const amount = Number.parseFloat(income.amount) || 0
                totalIncome += amount

                forecast.push({
                  id: `income-single-${income.id}`,
                  type: "income",
                  description: income.description || "Einmalige Einnahme",
                  amount: amount,
                  date: incomeDate,
                  category: income.categoryId
                    ? data.categories.find((c) => c.id === income.categoryId)?.name || "Allgemein"
                    : "Allgemein",
                  isRecurring: false,
                })
              }
            } catch (error) {
              console.error("Fehler beim Verarbeiten einer einmaligen Einnahme:", error)
            }
          })
      }

      // Sortiere nach Datum
      forecast.sort((a, b) => a.date.getTime() - b.date.getTime())

      // Berechne die Bilanz
      const balance = totalIncome - totalExpense

      // Aktualisiere den State
      setForecastData(forecast)
      setSummaryData({
        totalIncome,
        totalExpense,
        balance,
      })

      setIsLoading(false)
    } catch (error) {
      console.error("Fehler bei der Berechnung der Prognose:", error)
      setIsLoading(false)
    }
  }, [data, forecastMonths])

  // Filtere die Daten basierend auf dem aktiven Tab
  const filteredData = forecastData.filter((item) => {
    if (activeTab === "all") return true
    if (activeTab === "income") return item.type === "income"
    if (activeTab === "expense") return item.type === "expense"
    if (activeTab === "transfer") return item.type === "transfer"
    if (activeTab === "recurring") return item.isRecurring
    return true
  })

  // Exportiere die Prognose als CSV
  const exportForecast = () => {
    try {
      const headers = ["Datum", "Typ", "Beschreibung", "Betrag", "Kategorie", "Wiederkehrend"]
      const csvContent = [
        headers.join(","),
        ...filteredData.map((item) =>
          [
            format(item.date, "dd.MM.yyyy"),
            item.type === "income" ? "Einnahme" : "Ausgabe",
            `"${item.description.replace(/"/g, '""')}"`,
            item.amount,
            `"${item.category.replace(/"/g, '""')}"`,
            item.isRecurring ? "Ja" : "Nein",
          ].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `finanzprognose_${format(new Date(), "yyyy-MM-dd")}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Fehler beim Exportieren der Prognose:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Lade Prognosedaten...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finanzprognose</h1>
          <p className="text-muted-foreground">Prognose für die nächsten {forecastMonths} Monate</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={forecastMonths.toString()}
            onValueChange={(value) => setForecastMonths(Number.parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Zeitraum wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Monat</SelectItem>
              <SelectItem value="3">3 Monate</SelectItem>
              <SelectItem value="6">6 Monate</SelectItem>
              <SelectItem value="12">12 Monate</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={exportForecast}>
            <Download className="h-4 w-4" />
            <span className="sr-only">Exportieren</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prognostizierte Einnahmen</CardTitle>
            <ArrowUpFromLine className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency ? formatCurrency(summaryData.totalIncome) : `${summaryData.totalIncome.toFixed(2)} CHF`}
            </div>
            <p className="text-xs text-muted-foreground">Für die nächsten {forecastMonths} Monate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prognostizierte Ausgaben</CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency ? formatCurrency(summaryData.totalExpense) : `${summaryData.totalExpense.toFixed(2)} CHF`}
            </div>
            <p className="text-xs text-muted-foreground">Für die nächsten {forecastMonths} Monate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prognostizierte Bilanz</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summaryData.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatCurrency ? formatCurrency(summaryData.balance) : `${summaryData.balance.toFixed(2)} CHF`}
            </div>
            <p className="text-xs text-muted-foreground">Für die nächsten {forecastMonths} Monate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prognostizierte Transaktionen</CardTitle>
          <CardDescription>Detaillierte Auflistung aller prognostizierten Transaktionen</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Alle</TabsTrigger>
              <TabsTrigger value="income">Einnahmen</TabsTrigger>
              <TabsTrigger value="expense">Ausgaben</TabsTrigger>
              <TabsTrigger value="recurring">Wiederkehrend</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              {filteredData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Transaktionen für den ausgewählten Filter gefunden.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredData.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="font-medium">{item.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(item.date, "dd.MM.yyyy")} • {item.category}
                          {item.isRecurring && (
                            <Badge variant="outline" className="ml-2">
                              Wiederkehrend
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div
                        className={`font-medium ${
                          item.type === "income" ? "text-green-500" : item.type === "expense" ? "text-red-500" : ""
                        }`}
                      >
                        {formatCurrency ? formatCurrency(item.amount) : `${item.amount.toFixed(2)} CHF`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
