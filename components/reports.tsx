"use client"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart } from "@/components/charts/pie-chart"
import { IncomeExpenseChart } from "@/components/charts/income-expense-chart"
import { BarChart } from "@/components/charts/bar-chart"

export function Reports() {
  const {
    getExpensesByCategory,
    getIncomesByCategory,
    getExpensesByAccount,
    getIncomesByAccount,
    getExpensesByPerson,
    getIncomesByPerson,
    formatCurrency,
    getTotalExpenses,
    getTotalIncomes,
    getBalance,
    getSavingsRate,
  } = useFinance()

  const [activeTab, setActiveTab] = useState("overview")

  // Daten für die Diagramme
  const expensesByCategory = getExpensesByCategory()
  const incomesByCategory = getIncomesByCategory()
  const expensesByAccount = getExpensesByAccount()
  const incomesByAccount = getIncomesByAccount()
  const expensesByPerson = getExpensesByPerson()
  const incomesByPerson = getIncomesByPerson()

  // Formatiere die Daten für die Diagramme
  const formatChartData = (data: Record<string, number>) => {
    return Object.entries(data).map(([label, value]) => ({
      label,
      value,
    }))
  }

  const expensesByCategoryData = formatChartData(expensesByCategory)
  const incomesByCategoryData = formatChartData(incomesByCategory)
  const expensesByAccountData = formatChartData(expensesByAccount)
  const incomesByAccountData = formatChartData(incomesByAccount)
  const expensesByPersonData = formatChartData(expensesByPerson)
  const incomesByPersonData = formatChartData(incomesByPerson)

  // Berechne die Gesamtwerte
  const totalExpenses = getTotalExpenses()
  const totalIncomes = getTotalIncomes()
  const balance = getBalance()
  const savingsRate = getSavingsRate()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gesamteinnahmen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncomes)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gesamtausgaben</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bilanz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sparquote</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${savingsRate >= 0 ? "text-green-500" : "text-red-500"}`}>
              {savingsRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="categories">Kategorien</TabsTrigger>
          <TabsTrigger value="accounts">Konten</TabsTrigger>
          <TabsTrigger value="people">Personen</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <IncomeExpenseChart />
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ausgaben nach Kategorien</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <PieChart data={expensesByCategoryData} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Einnahmen nach Kategorien</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <PieChart data={incomesByCategoryData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="accounts" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ausgaben nach Konten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <BarChart data={expensesByAccountData} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Einnahmen nach Konten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <BarChart data={incomesByAccountData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="people" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ausgaben nach Personen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <PieChart data={expensesByPersonData} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Einnahmen nach Personen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <PieChart data={incomesByPersonData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
