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

  // Ersetze die direkten Variablendeklarationen mit try-catch-Blöcken
  const [expenses, setExpenses] = useState([])
  const [incomes, setIncomes] = useState([])
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalIncomes, setTotalIncomes] = useState(0)
  const [balance, setBalance] = useState(0)
  const [savingsRate, setSavingsRate] = useState(0)
  const [monthlyExpenseTrend, setMonthlyExpenseTrend] = useState([])
  const [monthlyIncomeTrend, setMonthlyIncomeTrend] = useState([])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    try {
      setExpenses(getFilteredExpenses())
      setIncomes(getFilteredIncomes())
      setTotalExpenses(getTotalExpenses())
      setTotalIncomes(getTotalIncomes())
      setBalance(getBalance())
      setSavingsRate(getSavingsRate())
      setMonthlyExpenseTrend(getMonthlyExpenseTrend())
      setMonthlyIncomeTrend(getMonthlyIncomeTrend())
    } catch (error) {
      console.error("Fehler beim Berechnen der Dashboard-Daten:", error)
    }
  }, [
    timeRange,
    data,
    getFilteredExpenses,
    getFilteredIncomes,
    getTotalExpenses,
    getTotalIncomes,
    getBalance,
    getSavingsRate,
    getMonthlyExpenseTrend,
    getMonthlyIncomeTrend,
  ])

  if (!isMounted) {
    return null
  }

  const latestTransactions = [...expenses, ...incomes]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

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
            <Progress value={savingsRate} className="h-2 mt-2" />
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

      <Card>
        <CardHeader>
          <CardTitle>Letzte Transaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Alle</TabsTrigger>
              <TabsTrigger value="expenses">Ausgaben</TabsTrigger>
              <TabsTrigger value="incomes">Einnahmen</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <TransactionList transactions={latestTransactions} limit={5} />
            </TabsContent>
            <TabsContent value="expenses">
              <TransactionList transactions={expenses} limit={5} />
            </TabsContent>
            <TabsContent value="incomes">
              <TransactionList transactions={incomes} limit={5} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
