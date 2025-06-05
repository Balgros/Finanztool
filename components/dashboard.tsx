"use client"

import { useState, useEffect } from "react"
import { useFinance } from "@/context/finance-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/date-range-picker"
import { TransactionList } from "@/components/transaction-list"
import { ArrowDownCircle, ArrowUpCircle, Wallet, PiggyBank } from "lucide-react"
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
    formatCurrency,
    data,
  } = useFinance()

  const [isMounted, setIsMounted] = useState(false)
  const [dashboardData, setDashboardData] = useState({
    expenses: [],
    incomes: [],
    totalExpenses: 0,
    totalIncomes: 0,
    balance: 0,
    savingsRate: 0,
    allTransactions: [],
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    try {
      const expenses = getFilteredExpenses() || []
      const incomes = getFilteredIncomes() || []
      const totalExpenses = getTotalExpenses() || 0
      const totalIncomes = getTotalIncomes() || 0
      const balance = getBalance() || 0
      const savingsRate = getSavingsRate() || 0

      // Kombiniere alle Transaktionen
      const allTransactions = [
        ...incomes.map((income) => ({ ...income, type: "income" })),
        ...expenses.map((expense) => ({ ...expense, type: "expense" })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setDashboardData({
        expenses,
        incomes,
        totalExpenses,
        totalIncomes,
        balance,
        savingsRate,
        allTransactions,
      })
    } catch (error) {
      console.error("Fehler beim Laden der Dashboard-Daten:", error)
      setDashboardData({
        expenses: [],
        incomes: [],
        totalExpenses: 0,
        totalIncomes: 0,
        balance: 0,
        savingsRate: 0,
        allTransactions: [],
      })
    }
  }, [
    isMounted,
    timeRange,
    data,
    getFilteredExpenses,
    getFilteredIncomes,
    getTotalExpenses,
    getTotalIncomes,
    getBalance,
    getSavingsRate,
  ])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Lade Dashboard...</div>
      </div>
    )
  }

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
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(dashboardData.totalIncomes)}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.incomes.length} Transaktionen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausgaben</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(dashboardData.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.expenses.length} Transaktionen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dashboardData.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(dashboardData.balance)}
            </div>
            <p className="text-xs text-muted-foreground">{dashboardData.balance >= 0 ? "Überschuss" : "Defizit"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sparquote</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.savingsRate.toFixed(1)}%</div>
            <Progress value={Math.max(0, Math.min(100, dashboardData.savingsRate))} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Letzte Transaktionen</CardTitle>
          <p className="text-sm text-muted-foreground">
            {dashboardData.allTransactions.length > 0
              ? `Die ${Math.min(10, dashboardData.allTransactions.length)} neuesten Transaktionen`
              : "Noch keine Transaktionen vorhanden"}
          </p>
        </CardHeader>
        <CardContent>
          {dashboardData.allTransactions.length > 0 ? (
            <TransactionList transactions={dashboardData.allTransactions} limit={10} />
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
