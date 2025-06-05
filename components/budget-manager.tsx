"use client"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { BudgetForm } from "@/components/forms/budget-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Pencil, Trash } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Budget } from "@/types/finance"

export function BudgetManager() {
  const { data, deleteBudget, getCategoryById, getFilteredExpenses, formatCurrency } = useFinance()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null)

  const handleEditBudget = (budget: Budget) => {
    setCurrentBudget(budget)
    setIsEditDialogOpen(true)
  }

  const handleDeleteBudget = (id: string) => {
    if (window.confirm("Möchtest du dieses Budget wirklich löschen?")) {
      deleteBudget(id)
    }
  }

  // Calculate budget usage
  const calculateBudgetUsage = (categoryId: string) => {
    const expenses = getFilteredExpenses().filter((expense) => expense.categoryId === categoryId)
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Neues Budget
        </Button>
      </div>

      {data.budgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground mb-4">Noch keine Budgets vorhanden.</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Budget erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.budgets.map((budget) => {
            const category = getCategoryById(budget.categoryId)
            const spent = calculateBudgetUsage(budget.categoryId)
            const percentage = Math.min(100, (spent / budget.amount) * 100)

            return (
              <Card key={budget.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {category && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />}
                      <CardTitle>{category?.name || "Unbekannte Kategorie"}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditBudget(budget)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteBudget(budget.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {budget.period === "monthly" ? "Monatlich" : "Jährlich"}
                      </span>
                      <span className="text-sm font-medium">
                        {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="text-sm text-right">
                      {percentage >= 100 ? (
                        <span className="text-red-500">Budget überschritten</span>
                      ) : (
                        <span className="text-muted-foreground">
                          Noch {formatCurrency(budget.amount - spent)} verfügbar
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Budget Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Neues Budget hinzufügen</DialogTitle>
          </DialogHeader>
          <BudgetForm onSuccess={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Budget Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Budget bearbeiten</DialogTitle>
          </DialogHeader>
          {currentBudget && <BudgetForm budget={currentBudget} onSuccess={() => setIsEditDialogOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
