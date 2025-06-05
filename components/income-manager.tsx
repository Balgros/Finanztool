"use client"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"
import { TransactionList } from "@/components/transaction-list"
import { IncomeForm } from "@/components/forms/income-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Plus, Filter, X, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Income } from "@/types/finance"

export function IncomeManager() {
  const { timeRange, setTimeRange, deleteIncome, data } = useFinance()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [currentIncome, setCurrentIncome] = useState<Income | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>("all")
  const [personFilter, setPersonFilter] = useState<string | null>("all")
  const [accountFilter, setAccountFilter] = useState<string | null>("all")
  const [incomeTypeFilter, setIncomeTypeFilter] = useState<string | null>("all")
  const [recurringFilter, setRecurringFilter] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")

  // Hole alle Einnahmen (ohne Zeitraumfilter)
  const allIncomes = data.incomes

  // Teile die Einnahmen in abgeschlossene und offene auf
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const completedIncomes = allIncomes.filter((income) => {
    const incomeDate = new Date(income.date)
    incomeDate.setHours(0, 0, 0, 0)
    return incomeDate <= today
  })

  const openIncomes = allIncomes.filter((income) => {
    const incomeDate = new Date(income.date)
    incomeDate.setHours(0, 0, 0, 0)
    return incomeDate > today
  })

  // Wende Filter auf die entsprechende Liste an
  const getFilteredIncomes = () => {
    let incomesToFilter: Income[] = []

    switch (activeTab) {
      case "completed":
        incomesToFilter = completedIncomes
        break
      case "open":
        incomesToFilter = openIncomes
        break
      default:
        incomesToFilter = allIncomes
    }

    // Wende zusätzliche Filter an
    return incomesToFilter
      .filter((income) => {
        const matchesSearch = income.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === "all" || income.categoryId === categoryFilter
        const matchesPerson = personFilter === "all" || income.personId === personFilter
        const matchesAccount = accountFilter === "all" || income.accountId === accountFilter
        const matchesIncomeType = incomeTypeFilter === "all" || income.incomeType === incomeTypeFilter
        const matchesRecurring = recurringFilter === null || income.isRecurring === recurringFilter

        return (
          matchesSearch && matchesCategory && matchesPerson && matchesAccount && matchesIncomeType && matchesRecurring
        )
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const filteredIncomes = getFilteredIncomes()

  const handleEdit = (income: Income) => {
    setCurrentIncome(income)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Möchtest du diese Einnahme wirklich löschen?")) {
      deleteIncome(id)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setPersonFilter("all")
    setAccountFilter("all")
    setIncomeTypeFilter("all")
    setRecurringFilter(null)
    setIsFilterDialogOpen(false)
  }

  const getIncomeTypeName = (type: string | undefined) => {
    switch (type) {
      case "regular":
        return "Reguläres Einkommen"
      case "bonus":
        return "Bonus"
      case "13thSalary":
        return "13. Monatsgehalt"
      case "sideIncome":
        return "Nebeneinkommen"
      case "other":
        return "Sonstiges"
      default:
        return "Alle Einkommensarten"
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Einnahmen</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <DateRangePicker timeRange={timeRange} onChange={setTimeRange} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsFilterDialogOpen(true)}>
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Neue Einnahme
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="completed">Abgeschlossen ({completedIncomes.length})</TabsTrigger>
          <TabsTrigger value="open">Offen ({openIncomes.length})</TabsTrigger>
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

      {(categoryFilter !== "all" ||
        personFilter !== "all" ||
        accountFilter !== "all" ||
        incomeTypeFilter !== "all" ||
        recurringFilter !== null) && (
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
          {incomeTypeFilter !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-2">
              Einkommensart: {getIncomeTypeName(incomeTypeFilter)}
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => setIncomeTypeFilter("all")}>
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

      <TransactionList transactions={filteredIncomes} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Dialog for adding new income */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Neue Einnahme hinzufügen</DialogTitle>
            <DialogDescription>Fügen Sie eine neue Einnahme zu Ihren Finanzen hinzu.</DialogDescription>
          </DialogHeader>
          <IncomeForm onSuccess={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialog for editing income */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Einnahme bearbeiten</DialogTitle>
            <DialogDescription>Bearbeiten Sie die ausgewählte Einnahme.</DialogDescription>
          </DialogHeader>
          {currentIncome && <IncomeForm income={currentIncome} onSuccess={() => setIsEditDialogOpen(false)} />}
        </DialogContent>
      </Dialog>

      {/* Dialog for filtering incomes */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Einnahmen filtern</DialogTitle>
            <DialogDescription>Wählen Sie Filter, um Ihre Einnahmen einzugrenzen.</DialogDescription>
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
                    .filter((category) => category.type === "income")
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
            <div>
              <Label htmlFor="incomeType">Einkommensart</Label>
              <Select value={incomeTypeFilter} onValueChange={(value) => setIncomeTypeFilter(value)}>
                <SelectTrigger id="incomeType">
                  <SelectValue placeholder="Alle Einkommensarten" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Einkommensarten</SelectItem>
                  <SelectItem value="regular">Reguläres Einkommen</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="13thSalary">13. Monatsgehalt</SelectItem>
                  <SelectItem value="sideIncome">Nebeneinkommen</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="recurring">Wiederkehrende Einnahmen</Label>
              <div className="flex items-center space-x-2">
                <Select
                  value={recurringFilter === null ? "all" : recurringFilter ? "true" : "false"}
                  onValueChange={(value) => {
                    if (value === "all") setRecurringFilter(null)
                    else setRecurringFilter(value === "true")
                  }}
                >
                  <SelectTrigger id="recurring" className="w-[180px]">
                    <SelectValue placeholder="Alle Einnahmen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Einnahmen</SelectItem>
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
