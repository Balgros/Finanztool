"use client"

import type React from "react"
import { isWithinInterval, parseISO, startOfMonth, endOfMonth } from "date-fns"
import { de } from "date-fns/locale"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowUpCircle, ArrowDownCircle, Wallet, PiggyBank, TrendingUp, ListChecks, Repeat } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export function Dashboard() {
  const {
    // Using the main data system now
    data,
    addIncome,
    addExpense,
    // getTotalIncomes, // Use the main one
    // getTotalExpenses, // Use the main one
    // getBalance, // Use the main one
    formatCurrency,
    getSavingsRate,
    timeRange, // To show current period if needed
  } = useFinance()

  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("income")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))

  // Calculate totals from the main data system for the current timeRange
  const currentTotalIncomes = data.incomes
    .filter((inc) => isWithinInterval(parseISO(inc.date), { start: timeRange.from, end: timeRange.to }))
    .reduce((sum, inc) => sum + inc.amount, 0)
  const currentTotalExpenses = data.expenses
    .filter((exp) => isWithinInterval(parseISO(exp.date), { start: timeRange.from, end: timeRange.to }))
    .reduce((sum, exp) => sum + exp.amount, 0)
  const currentBalance = currentTotalIncomes - currentTotalExpenses
  const currentSavingsRate = getSavingsRate(true) // true for filtered by timeRange

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount || !date) return

    const transactionAmount = Number.parseFloat(amount)
    const commonDetails = {
      description,
      amount: transactionAmount,
      date,
      categoryId: "", // Needs a default or selector
      accountId: data.accounts[0]?.id || "", // Needs a default or selector
      personId: data.people[0]?.id || "", // Needs a default or selector
      notes: "Schnelle Transaktion",
      isRecurring: false,
    }

    if (type === "income") {
      addIncome({ ...commonDetails, incomeType: "other" })
    } else {
      addExpense(commonDetails)
    }

    setDescription("")
    setAmount("")
    setDate(format(new Date(), "yyyy-MM-dd"))
  }

  const totalAssets = data.accounts.reduce((sum, account) => sum + account.balance, 0)
  const recentTransactions = [...data.incomes, ...data.expenses]
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Zeitraum: {format(timeRange.from, "dd.MM.yy", { locale: de })} -{" "}
          {format(timeRange.to, "dd.MM.yy", { locale: de })}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Einnahmen ({format(timeRange.from, "MMM", { locale: de })})
            </CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(currentTotalIncomes)}</div>
            <p className="text-xs text-muted-foreground">
              {
                data.incomes.filter((inc) =>
                  isWithinInterval(parseISO(inc.date), { start: timeRange.from, end: timeRange.to }),
                ).length
              }{" "}
              Transaktionen
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ausgaben ({format(timeRange.from, "MMM", { locale: de })})
            </CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatCurrency(currentTotalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {
                data.expenses.filter((exp) =>
                  isWithinInterval(parseISO(exp.date), { start: timeRange.from, end: timeRange.to }),
                ).length
              }{" "}
              Transaktionen
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo ({format(timeRange.from, "MMM", { locale: de })})
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentBalance >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatCurrency(currentBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Sparquote: {currentSavingsRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtvermögen</CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{formatCurrency(totalAssets)}</div>
            <p className="text-xs text-muted-foreground">{data.accounts.length} Konten</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Schnelle Transaktion</CardTitle>
            <CardDescription>Füge schnell eine Einnahme oder Ausgabe hinzu.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Betrag</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Datum</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Typ</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={type === "income" ? "default" : "outline"}
                    onClick={() => setType("income")}
                    className="flex-1"
                  >
                    Einnahme
                  </Button>
                  <Button
                    type="button"
                    variant={type === "expense" ? "default" : "outline"}
                    onClick={() => setType("expense")}
                    className="flex-1"
                  >
                    Ausgabe
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Hinzufügen
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Letzte Transaktionen</CardTitle>
            <CardDescription>Die 5 aktuellsten Einnahmen und Ausgaben.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Keine Transaktionen vorhanden.</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => {
                  const isIncome = "incomeType" in transaction // Check if it's an Income object
                  const category = data.categories.find((c) => c.id === transaction.categoryId)
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isIncome ? (
                          <ArrowUpCircle className="h-5 w-5 text-green-500 shrink-0" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-red-500 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium truncate max-w-[150px] sm:max-w-xs" title={transaction.description}>
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(transaction.date), "dd.MM.yyyy", { locale: de })}
                            {category && (
                              <span
                                className="ml-2 px-1.5 py-0.5 rounded-full text-xs"
                                style={{ backgroundColor: category.color + "30", color: category.color }}
                              >
                                {category.name}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold ${isIncome ? "text-green-600" : "text-red-600"}`}>
                        {isIncome ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  )
                })}
                {recentTransactions.length > 0 && (
                  <div className="pt-2 text-center">
                    <Button variant="link" asChild>
                      <Link href={data.incomes.length > data.expenses.length ? "/einnahmen" : "/ausgaben"}>
                        Alle Transaktionen anzeigen
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-blue-500" /> Budgets
            </CardTitle>
            <CardDescription>Aktueller Status Ihrer Budgets.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.budgets.length === 0 ? (
              <p className="text-muted-foreground text-sm">Keine Budgets definiert.</p>
            ) : (
              data.budgets.slice(0, 3).map((budget) => {
                const category = data.categories.find((c) => c.id === budget.categoryId)
                const spent = data.expenses
                  .filter(
                    (e) =>
                      e.categoryId === budget.categoryId &&
                      isWithinInterval(parseISO(e.date), {
                        start: startOfMonth(new Date()),
                        end: endOfMonth(new Date()),
                      }),
                  )
                  .reduce((sum, e) => sum + e.amount, 0)
                const progress = Math.min(100, (spent / budget.amount) * 100)
                return (
                  <div key={budget.id} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{category?.name || "Unbekannt"}</span>
                      <span>
                        {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )
              })
            )}
            {data.budgets.length > 0 && (
              <Button variant="link" asChild className="mt-2 p-0 h-auto">
                <Link href="/budgets">Alle Budgets</Link>
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-purple-500" /> Wiederkehrend
            </CardTitle>
            <CardDescription>Anstehende wiederkehrende Zahlungen.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for upcoming recurring transactions */}
            <p className="text-muted-foreground text-sm">Funktion in Entwicklung.</p>
            <Button variant="link" asChild className="mt-2 p-0 h-auto">
              <Link href="/wiederkehrend">Alle anzeigen</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" /> Finanzielle Ziele
            </CardTitle>
            <CardDescription>Fortschritt Ihrer Sparziele.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for financial goals */}
            <p className="text-muted-foreground text-sm">Funktion in Entwicklung.</p>
            <Button variant="link" asChild className="mt-2 p-0 h-auto">
              <Link href="/forecast">Prognose & Ziele</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
