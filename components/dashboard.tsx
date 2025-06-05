"use client"

import { useState, useEffect } from "react"
import { useFinance } from "@/context/finance-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/date-range-picker"
import { TransactionList } from "@/components/transaction-list"
import { PieChart } from "@/components/charts/pie-chart"
import { LineChart } from "@/components/charts/line-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownCircle, ArrowUpCircle, Wallet, PiggyBank } from "lucide-react"
import { AccountSummary } from "@/components/account-summary"
import { Progress } from "@/components/ui/progress"

export function Dashboard() {
  const {
    timeRange,
    setTimeRange,
    getFilteredExpenses,
    getFilteredIncomes,
    getTotalExpenses,
    getTotalIncomes,
    getBalance,
    getSavingsRate,
    getExpensesByCategory,
    getIncomesByCategory,
    getMonthlyExpenseTrend,
    getMonthlyIncomeTrend,
    formatCurrency,
    data,
  } = useFinance()

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  // Sichere Berechnung der Werte mit Fehlerbehandlung
  let expenses = []
  let incomes = []
  let totalExpenses = 0
  let totalIncomes = 0
  let balance = 0
  let savingsRate = 0
  let monthlyExpenseTrend = []
  let monthlyIncomeTrend = []

  try {
    expenses = getFilteredExpenses() || []
    incomes = getFilteredIncomes() || []
    totalExpenses = getTotalExpenses() || 0
    totalIncomes = getTotalIncomes() || 0
    balance = getBalance() || 0
    savingsRate = getSavingsRate() || 0
    monthlyExpenseTrend = getMonthlyExpenseTrend() || []
    monthlyIncomeTrend = getMonthlyIncomeTrend() || []
  } catch (error) {
    console.error("Fehler beim Berechnen der Dashboard-Daten:", error)
  }

  // Kombiniere alle Transaktionen und sortiere sie nach Datum (neueste zuerst)
  const getAllTransactions = () => {
    try {
      const allTransactions = []

      // Füge alle Einnahmen hinzu
      if (data.incomes && Array.isArray(data.incomes)) {
        data.incomes.forEach((income) => {
          allTransactions.push({
            ...income,
            type: "income",
          })
        })
      }

      // Füge alle Ausgaben hinzu
      if (data.expenses && Array.isArray(data.expenses)) {
        data.expenses.forEach((expense) => {
          allTransactions.push({
            ...expense,
            type: "expense",
          })
        })
      }

      // Sortiere nach Datum (neueste zuerst)
      return allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } catch (error) {
      console.error("Fehler beim Abrufen aller Transaktionen:", error)
      return []
    }
  }

  const allTransactions = getAllTransactions()
  const latestTransactions = allTransactions.slice(0, 10) // Zeige die letzten 10 Transaktionen

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <DateRangePicker timeRange={timeRange} onChange={setTimeRange} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Einnahmen</CardTitle>
            <ArrowUpCircle className="h-4 w-4 income-text" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold income-text">{formatCurrency(totalIncomes)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausgaben</CardTitle>
            <ArrowDownCircle className="h-4 w-4 expense-text" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold expense-text">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "income-text" : "expense-text"}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sparquote</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savingsRate.toFixed(1)}%</div>
            <Progress value={Math.max(0, Math.min(100, savingsRate))} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Kontoübersicht</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <AccountSummary />
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Einnahmen vs. Ausgaben (6 Monate)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <LineChart
              incomeData={monthlyIncomeTrend.map((item) => ({ label: item.month, value: item.amount }))}
              expenseData={monthlyExpenseTrend.map((item) => ({ label: item.month, value: item.amount }))}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ausgaben nach Kategorien</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <PieChart data={getExpensesByCategory()} />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Einnahmen nach Kategorien</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <PieChart data={getIncomesByCategory()} />
          </CardContent>
        </Card>
      </div>

      {/* Verbesserte Anzeige der letzten Transaktionen */}
      <Card>
        <CardHeader>
          <CardTitle>Letzte Transaktionen</CardTitle>
          <p className="text-sm text-muted-foreground">
            Die {latestTransactions.length} neuesten Transaktionen aus allen Kategorien
          </p>
        </CardHeader>
        <CardContent>
          {latestTransactions.length > 0 ? (
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">Alle ({latestTransactions.length})</TabsTrigger>
                <TabsTrigger value="expenses">Ausgaben ({expenses.length})</TabsTrigger>
                <TabsTrigger value="incomes">Einnahmen ({incomes.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <TransactionList transactions={latestTransactions} limit={10} />
              </TabsContent>
              <TabsContent value="expenses" className="mt-4">
                <TransactionList transactions={expenses} limit={5} />
              </TabsContent>
              <TabsContent value="incomes" className="mt-4">
                <TransactionList transactions={incomes} limit={5} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Noch keine Transaktionen vorhanden</p>
              <p className="text-sm text-muted-foreground">
                Fügen Sie Ihre ersten Einnahmen oder Ausgaben hinzu, um sie hier zu sehen.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
