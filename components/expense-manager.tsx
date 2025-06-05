"use client"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"
import { TransactionList } from "@/components/transaction-list"
import { ExpenseForm } from "@/components/forms/expense-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Plus, Filter, X, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Expense } from "@/types/finance"

export function ExpenseManager() {
  const { timeRange, setTimeRange, data, deleteExpense } = useFinance()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>("all")
  const [personFilter, setPersonFilter] = useState<string | null>("all")
  const [accountFilter, setAccountFilter] = useState<string | null>("all")
  const [recurringFilter, setRecurringFilter] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")

  // Hole alle Ausgaben (ohne Zeitraumfilter)
  const allExpenses = data.expenses

  // Teile die Ausgaben in abgeschlossene und offene auf
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const completedExpenses = allExpenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    expenseDate.setHours(0, 0, 0, 0)
    return expenseDate <= today
  })

  const openExpenses = allExpenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    expenseDate.setHours(0, 0, 0, 0)
    return expenseDate > today
  })

  // Wende Filter auf die entsprechende Liste an
  const getFilteredExpenses = () => {
    let expensesToFilter: Expense[] = []

    switch (activeTab) {
      case "completed":
        expensesToFilter = completedExpenses
        break
      case "open":
        expensesToFilter = openExpenses
        break
      default:
        expensesToFilter = allExpenses
    }

    // Wende zusätzliche Filter an
    return expensesToFilter
      .filter((expense) => {
        const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === "all" || expense.categoryId === categoryFilter
        const matchesPerson = personFilter === "all" || expense.personId === personFilter
        const matchesAccount = accountFilter === "all" || expense.accountId === accountFilter
        const matchesRecurring = recurringFilter === null || expense.isRecurring === recurringFilter

        return matchesSearch && matchesCategory && matchesPerson && matchesAccount && matchesRecurring
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const filteredExpenses = getFilteredExpenses()

  const handleEdit = (expense: Expense) => {
    setCurrentExpense(expense)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Möchtest du diese Ausgabe wirklich löschen?")) {
      deleteExpense(id)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setPersonFilter("all")
    setAccountFilter("all")
    setRecurringFilter(null)
    setIsFilterDialogOpen(false)
  }

  const getCategoryName = (id: string | null) => {
    if (id === "all") return "Alle Kategorien"
    const category = data.categories.find((c) => c.id === id)
    return category ? category.name : "Unbekannte Kategorie"
  }

  const getPersonName = (id: string | null) => {
    if (id === "all") return "Alle Personen"
    const person = data.people.find((p) => p.id === id)
    return person ? person.name : "Unbekannte Person"
  }

  const getAccountName = (id: string | null) => {
    if (id === "all") return "Alle Konten"
    const account = data.accounts.find((a) => a.id === id)
    return account ? account.name : "Unbekanntes Konto"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Ausgaben</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <DateRangePicker timeRange={timeRange} onChange={setTimeRange} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsFilterDialogOpen(true)}>
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Neue Ausgabe
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="completed">Abgeschlossen ({completedExpenses.length})</TabsTrigger>
          <TabsTrigger value="open">Offen ({openExpenses.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative">
        <Input
          placeholder="Suche nach Beschreibung..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setSearchTerm("")}
          >
            ✕
          </Button>
        )}
      </div>

      {(categoryFilter !== "all" || personFilter !== "all" || accountFilter !== "all" || recurringFilter !== null) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {categoryFilter !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-2">
              Kategorie: {getCategoryName(categoryFilter)}
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => setCategoryFilter("all")}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {personFilter !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-2">
              Person: {getPersonName(personFilter)}
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => setPersonFilter("all")}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {accountFilter !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-2">
              Konto: {getAccountName(accountFilter)}
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => setAccountFilter("all")}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {recurringFilter !== null && (
            <Badge variant="secondary" className="flex items-center gap-2">
              {recurringFilter ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" /> Wiederkehrend
                </>
              ) : (
                "Einmalig"
              )}
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => setRecurringFilter(null)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      <TransactionList transactions={filteredExpenses} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Dialog for adding new expense */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Neue Ausgabe hinzufügen</DialogTitle>
            <DialogDescription>Fügen Sie eine neue Ausgabe zu Ihren Finanzen hinzu.</DialogDescription>
          </DialogHeader>
          <ExpenseForm onSuccess={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialog for editing expense */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ausgabe bearbeiten</DialogTitle>
            <DialogDescription>Bearbeiten Sie die ausgewählte Ausgabe.</DialogDescription>
          </DialogHeader>
          {currentExpense && <ExpenseForm expense={currentExpense} onSuccess={() => setIsEditDialogOpen(false)} />}
        </DialogContent>
      </Dialog>

      {/* Dialog for filtering expenses */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ausgaben filtern</DialogTitle>
            <DialogDescription>Wählen Sie Filter, um Ihre Ausgaben einzugrenzen.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Kategorie</Label>
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Alle Kategorien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  {data.categories
                    .filter((category) => category.type === "expense")
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="person">Person</Label>
              <Select value={personFilter} onValueChange={(value) => setPersonFilter(value)}>
                <SelectTrigger id="person">
                  <SelectValue placeholder="Alle Personen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Personen</SelectItem>
                  {data.people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="account">Konto</Label>
              <Select value={accountFilter} onValueChange={(value) => setAccountFilter(value)}>
                <SelectTrigger id="account">
                  <SelectValue placeholder="Alle Konten" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Konten</SelectItem>
                  {data.accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="recurring">Wiederkehrende Ausgaben</Label>
              <div className="flex items-center space-x-2">
                <Select
                  value={recurringFilter === null ? "all" : recurringFilter ? "true" : "false"}
                  onValueChange={(value) => {
                    if (value === "all") setRecurringFilter(null)
                    else setRecurringFilter(value === "true")
                  }}
                >
                  <SelectTrigger id="recurring" className="w-[180px]">
                    <SelectValue placeholder="Alle Ausgaben" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Ausgaben</SelectItem>
                    <SelectItem value="true">Wiederkehrend</SelectItem>
                    <SelectItem value="false">Einmalig</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" onClick={clearFilters} className="w-full">
              <X className="mr-2 h-4 w-4" /> Filter zurücksetzen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
