"use client"

import type React from "react"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowUpCircle, ArrowDownCircle, Wallet, PiggyBank } from "lucide-react"

export function Dashboard() {
  const {
    transactions,
    addTransaction,
    removeTransaction,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    formatCurrency,
    data,
    getTotalIncomes,
    getTotalExpenses,
    getSavingsRate,
  } = useFinance()

  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("income")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description || !amount) return

    addTransaction({
      description,
      amount: Number.parseFloat(amount),
      type,
      date: new Date().toISOString().split("T")[0],
    })

    setDescription("")
    setAmount("")
  }

  // Berechne Gesamtvermögen aus allen Konten
  const totalAssets = data.accounts.reduce((sum, account) => sum + account.balance, 0)

  // Berechne die Anzahl der Transaktionen
  const totalTransactions = data.incomes.length + data.expenses.length
  const recentTransactions = [...data.incomes, ...data.expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">Willkommen zurück! Hier ist Ihre Finanzübersicht.</div>
      </div>

      {/* Hauptstatistiken */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamteinnahmen</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(getTotalIncomes())}</div>
            <p className="text-xs text-muted-foreground">+{data.incomes.length} Transaktionen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtausgaben</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(getTotalExpenses())}</div>
            <p className="text-xs text-muted-foreground">+{data.expenses.length} Transaktionen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getBalance() >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(getBalance())}
            </div>
            <p className="text-xs text-muted-foreground">Sparquote: {getSavingsRate().toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtvermögen</CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalAssets)}</div>
            <p className="text-xs text-muted-foreground">{data.accounts.length} Konten</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Schnelle Transaktion */}
        <Card>
          <CardHeader>
            <CardTitle>Schnelle Transaktion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="z.B. Gehalt oder Einkauf"
                  required
                />
              </div>

              <div>
                <Label htmlFor="amount">Betrag (CHF)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label>Typ</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={type === "income"}
                      onChange={() => setType("income")}
                      className="h-4 w-4"
                    />
                    <span>Einnahme</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={type === "expense"}
                      onChange={() => setType("expense")}
                      className="h-4 w-4"
                    />
                    <span>Ausgabe</span>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Transaktion hinzufügen
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Letzte Transaktionen */}
        <Card>
          <CardHeader>
            <CardTitle>Letzte Transaktionen</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Noch keine Transaktionen vorhanden</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => {
                  const isIncome = "incomeType" in transaction
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {isIncome ? (
                          <ArrowUpCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <span className={isIncome ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {isIncome ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Einfache Transaktionsliste */}
      <Card>
        <CardHeader>
          <CardTitle>Einfache Transaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Noch keine einfachen Transaktionen vorhanden</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">{transaction.date}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => removeTransaction(transaction.id)}>
                      Löschen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
