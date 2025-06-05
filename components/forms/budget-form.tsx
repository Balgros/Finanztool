"use client"

import type React from "react"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Budget } from "@/types/finance"

interface BudgetFormProps {
  budget?: Budget
  onSuccess: () => void
}

export function BudgetForm({ budget, onSuccess }: BudgetFormProps) {
  const { data, addBudget, updateBudget } = useFinance()

  const [formData, setFormData] = useState({
    id: budget?.id || "",
    categoryId: budget?.categoryId || "",
    amount: budget?.amount.toString() || "",
    period: budget?.period || "monthly",
  })

  const expenseCategories = data.categories.filter((category) => category.type === "expense")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const budgetData = {
      ...formData,
      amount: Number.parseFloat(formData.amount),
      period: formData.period as "monthly" | "yearly",
    }

    if (budget) {
      updateBudget(budgetData as Budget)
    } else {
      addBudget(budgetData)
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Kategorie</Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Kategorie wählen" />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Budgetbetrag</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="period">Zeitraum</Label>
        <Select
          value={formData.period}
          onValueChange={(value) => setFormData({ ...formData, period: value as "monthly" | "yearly" })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Zeitraum wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monatlich</SelectItem>
            <SelectItem value="yearly">Jährlich</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Abbrechen
        </Button>
        <Button type="submit">{budget ? "Aktualisieren" : "Hinzufügen"}</Button>
      </div>
    </form>
  )
}
