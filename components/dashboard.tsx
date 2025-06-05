"use client"

import type React from "react"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function Dashboard() {
  const {
    transactions,
    addTransaction,
    removeTransaction,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    formatCurrency,
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Statistiken */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Einnahmen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(getTotalIncome())}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Ausgaben</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(getTotalExpense())}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getBalance() >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(getBalance())}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Neue Transaktion */}
      <Card>
        <CardHeader>
          <CardTitle>Neue Transaktion</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreibung eingeben"
                required
              />
            </div>

            <div>
              <Label htmlFor="amount">Betrag</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label>Typ</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="income"
                    checked={type === "income"}
                    onChange={(e) => setType(e.target.value as "income" | "expense")}
                    className="mr-2"
                  />
                  Einnahme
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="expense"
                    checked={type === "expense"}
                    onChange={(e) => setType(e.target.value as "income" | "expense")}
                    className="mr-2"
                  />
                  Ausgabe
                </label>
              </div>
            </div>

            <Button type="submit">Hinzufügen</Button>
          </form>
        </CardContent>
      </Card>

      {/* Transaktionsliste */}
      <Card>
        <CardHeader>
          <CardTitle>Transaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Noch keine Transaktionen vorhanden</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-500">{transaction.date}</div>
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
