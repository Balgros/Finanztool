"use client"

import { useState, useEffect } from "react"
import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { IncomeForm } from "@/components/forms/income-form"
import { ExpenseForm } from "@/components/forms/expense-form"
import { format, isAfter } from "date-fns"
import { de } from "date-fns/locale"
import {
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Edit,
  Trash,
  PauseCircle,
  PlayCircle,
  Calendar,
  Hash,
  Clock,
  AlertCircle,
} from "lucide-react"
import type { Income, Expense } from "@/types/finance"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function RecurringTransactionsManager() {
  const {
    data,
    deleteIncome,
    deleteExpense,
    updateIncome,
    updateExpense,
    generateAllRecurringTransactions,
    formatCurrency,
  } = useFinance()
  const [isEditIncomeDialogOpen, setIsEditIncomeDialogOpen] = useState(false)
  const [isEditExpenseDialogOpen, setIsEditExpenseDialogOpen] = useState(false)
  const [currentIncome, setCurrentIncome] = useState<Income | null>(null)
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null)
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)
  const [generationStats, setGenerationStats] = useState({ incomes: 0, expenses: 0 })

  // Filtere wiederkehrende Transaktionen
  const recurringIncomes = data.incomes.filter((income) => income.isRecurring)
  const recurringExpenses = data.expenses.filter((expense) => expense.isRecurring)

  // Funktion zum Formatieren des Intervalls
  const formatInterval = (interval: string) => {
    switch (interval) {
      case "weekly":
        return "Wöchentlich"
      case "biweekly":
        return "Alle 2 Wochen"
      case "monthly":
        return "Monatlich"
      case "bimonthly":
        return "Alle 2 Monate"
      case "quarterly":
        return "Vierteljährlich"
      case "semiannually":
        return "Halbjährlich"
      case "yearly":
        return "Jährlich"
      default:
        return interval
    }
  }

  // Funktion zum Berechnen des nächsten Datums
  const getNextDate = (date: string, interval: string) => {
    const baseDate = new Date(date)
    const nextDate = new Date(baseDate)

    switch (interval) {
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7)
        break
      case "biweekly":
        nextDate.setDate(nextDate.getDate() + 14)
        break
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
      case "bimonthly":
        nextDate.setMonth(nextDate.getMonth() + 2)
        break
      case "quarterly":
        nextDate.setMonth(nextDate.getMonth() + 3)
        break
      case "semiannually":
        nextDate.setMonth(nextDate.getMonth() + 6)
        break
      case "yearly":
        nextDate.setFullYear(nextDate.getFullYear() + 1)
        break
    }

    return format(nextDate, "dd.MM.yyyy", { locale: de })
  }

  // Funktion zum manuellen Generieren wiederkehrender Transaktionen
  const handleGenerateRecurring = () => {
    const stats = generateAllRecurringTransactions()
    setGenerationStats(stats)
    setLastGenerated(new Date())
  }

  // Bearbeiten einer wiederkehrenden Einnahme
  const handleEditIncome = (income: Income) => {
    setCurrentIncome(income)
    setIsEditIncomeDialogOpen(true)
  }

  // Bearbeiten einer wiederkehrenden Ausgabe
  const handleEditExpense = (expense: Expense) => {
    setCurrentExpense(expense)
    setIsEditExpenseDialogOpen(true)
  }

  // Löschen einer wiederkehrenden Einnahme
  const handleDeleteIncome = (id: string) => {
    if (window.confirm("Möchtest du diese wiederkehrende Einnahme wirklich löschen?")) {
      deleteIncome(id)
    }
  }

  // Löschen einer wiederkehrenden Ausgabe
  const handleDeleteExpense = (id: string) => {
    if (window.confirm("Möchtest du diese wiederkehrende Ausgabe wirklich löschen?")) {
      deleteExpense(id)
    }
  }

  // Pausieren/Fortsetzen einer wiederkehrenden Einnahme
  const handleTogglePauseIncome = (income: Income) => {
    const updatedIncome = {
      ...income,
      recurringConfig: {
        ...income.recurringConfig,
        isPaused: !(income.recurringConfig?.isPaused || false),
      },
    }
    updateIncome(updatedIncome)
  }

  // Pausieren/Fortsetzen einer wiederkehrenden Ausgabe
  const handleTogglePauseExpense = (expense: Expense) => {
    const updatedExpense = {
      ...expense,
      recurringConfig: {
        ...expense.recurringConfig,
        isPaused: !(expense.recurringConfig?.isPaused || false),
      },
    }
    updateExpense(updatedExpense)
  }

  // Automatisch wiederkehrende Transaktionen generieren, wenn die Komponente geladen wird
  useEffect(() => {
    const stats = generateAllRecurringTransactions()
    setGenerationStats(stats)
    setLastGenerated(new Date())
  }, [])

  // Lokale Formatierungsfunktion als Fallback
  const formatCurrencyLocal = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: data.settings.currency || "CHF",
    }).format(amount)
  }

  // Verwende die formatCurrency-Funktion aus dem Context oder die lokale Fallback-Funktion
  const formatAmount = (amount: number) => {
    try {
      return formatCurrency ? formatCurrency(amount) : formatCurrencyLocal(amount)
    } catch (error) {
      return formatCurrencyLocal(amount)
    }
  }

  // Funktion zum Anzeigen des Status einer wiederkehrenden Transaktion
  const getRecurringStatus = (transaction: Income | Expense) => {
    const config = transaction.recurringConfig

    if (!config) return null

    if (config.isPaused) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-yellow-500">
                <PauseCircle className="h-4 w-4 mr-1" />
                <span>Pausiert</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Diese wiederkehrende Transaktion ist pausiert und wird nicht automatisch generiert.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    if (config.endDate && isAfter(new Date(), new Date(config.endDate))) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-gray-500">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Beendet</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Diese wiederkehrende Transaktion ist beendet, da das Enddatum erreicht wurde.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    if (config.occurrences && config.occurrences <= 0) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-gray-500">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Beendet</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Diese wiederkehrende Transaktion ist beendet, da alle Wiederholungen abgeschlossen sind.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center text-green-500">
              <PlayCircle className="h-4 w-4 mr-1" />
              <span>Aktiv</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Diese wiederkehrende Transaktion ist aktiv und wird automatisch generiert.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Funktion zum Anzeigen der Konfiguration einer wiederkehrenden Transaktion
  const getRecurringConfigDetails = (transaction: Income | Expense) => {
    const config = transaction.recurringConfig

    if (!config) return null

    const details = []

    if (config.startDate && config.startDate !== transaction.date) {
      details.push(
        <div key="startDate" className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          <span>Start: {format(new Date(config.startDate), "dd.MM.yyyy", { locale: de })}</span>
        </div>,
      )
    }

    if (config.endDate) {
      details.push(
        <div key="endDate" className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          <span>Ende: {format(new Date(config.endDate), "dd.MM.yyyy", { locale: de })}</span>
        </div>,
      )
    }

    if (config.occurrences && config.occurrences > 0) {
      details.push(
        <div key="occurrences" className="flex items-center text-xs text-muted-foreground">
          <Hash className="h-3 w-3 mr-1" />
          <span>{config.occurrences} Wiederholungen</span>
        </div>,
      )
    }

    if (
      config.dayOfMonth &&
      (transaction.recurringInterval === "monthly" ||
        transaction.recurringInterval === "bimonthly" ||
        transaction.recurringInterval === "quarterly" ||
        transaction.recurringInterval === "semiannually" ||
        transaction.recurringInterval === "yearly")
    ) {
      details.push(
        <div key="dayOfMonth" className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>Tag {config.dayOfMonth} des Monats</span>
        </div>,
      )
    }

    return details.length > 0 ? <div className="mt-2 space-y-1">{details}</div> : null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Wiederkehrende Transaktionen</h1>
        <Button onClick={handleGenerateRecurring}>
          <RefreshCw className="mr-2 h-4 w-4" /> Jetzt generieren
        </Button>
      </div>

      {lastGenerated && (
        <div className="text-sm text-muted-foreground">
          <p>Zuletzt generiert: {format(lastGenerated, "dd.MM.yyyy HH:mm:ss", { locale: de })}</p>
          {(generationStats.incomes > 0 || generationStats.expenses > 0) && (
            <p className="mt-1">
              Erstellt: {generationStats.incomes} Einnahme(n), {generationStats.expenses} Ausgabe(n)
            </p>
          )}
        </div>
      )}

      <Tabs defaultValue="incomes">
        <TabsList>
          <TabsTrigger value="incomes">
            Einnahmen <Badge className="ml-2 bg-green-500">{recurringIncomes.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="expenses">
            Ausgaben <Badge className="ml-2 bg-red-500">{recurringExpenses.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incomes" className="space-y-4">
          {recurringIncomes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-muted-foreground mb-4">Keine wiederkehrenden Einnahmen vorhanden.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recurringIncomes.map((income) => {
                const category = data.categories.find((c) => c.id === income.categoryId)
                const account = data.accounts.find((a) => a.id === income.accountId)
                const person = data.people.find((p) => p.id === income.personId)

                return (
                  <Card key={income.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <CardTitle className="text-lg">{income.description}</CardTitle>
                          {income.recurringConfig?.isPaused && (
                            <Badge variant="outline" className="ml-2 text-yellow-500 border-yellow-500">
                              Pausiert
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleTogglePauseIncome(income)}>
                                  {income.recurringConfig?.isPaused ? (
                                    <PlayCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <PauseCircle className="h-4 w-4 text-yellow-500" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {income.recurringConfig?.isPaused ? "Fortsetzen" : "Pausieren"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <Button variant="ghost" size="icon" onClick={() => handleEditIncome(income)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteIncome(income.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-green-500/10">
                              <ArrowUpCircle className="h-4 w-4 text-green-500" />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatInterval(income.recurringInterval || "monthly")}
                            </span>
                          </div>
                          <span className="font-medium text-green-500">+{formatAmount(income.amount)}</span>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">Letzte Ausführung</span>
                            <span>{format(new Date(income.date), "dd.MM.yyyy", { locale: de })}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-medium">Nächste Ausführung</span>
                            <span>
                              {income.recurringConfig?.isPaused
                                ? "Pausiert"
                                : getNextDate(income.date, income.recurringInterval || "monthly")}
                            </span>
                          </div>
                        </div>

                        {getRecurringConfigDetails(income)}

                        <div className="flex flex-wrap gap-2 mt-2">
                          {category && (
                            <Badge style={{ backgroundColor: category.color, color: "#fff" }}>{category.name}</Badge>
                          )}
                          {account && (
                            <Badge variant="outline" style={{ borderColor: account.color, color: account.color }}>
                              {account.name}
                            </Badge>
                          )}
                          {person && (
                            <Badge variant="outline" style={{ borderColor: person.color, color: person.color }}>
                              {person.name}
                            </Badge>
                          )}
                        </div>

                        {income.notes && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Notizen:</span> {income.notes}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          {recurringExpenses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-muted-foreground mb-4">Keine wiederkehrenden Ausgaben vorhanden.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recurringExpenses.map((expense) => {
                const category = data.categories.find((c) => c.id === expense.categoryId)
                const account = data.accounts.find((a) => a.id === expense.accountId)
                const person = data.people.find((p) => p.id === expense.personId)

                return (
                  <Card key={expense.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <CardTitle className="text-lg">{expense.description}</CardTitle>
                          {expense.recurringConfig?.isPaused && (
                            <Badge variant="outline" className="ml-2 text-yellow-500 border-yellow-500">
                              Pausiert
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleTogglePauseExpense(expense)}>
                                  {expense.recurringConfig?.isPaused ? (
                                    <PlayCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <PauseCircle className="h-4 w-4 text-yellow-500" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {expense.recurringConfig?.isPaused ? "Fortsetzen" : "Pausieren"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <Button variant="ghost" size="icon" onClick={() => handleEditExpense(expense)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-red-500/10">
                              <ArrowDownCircle className="h-4 w-4 text-red-500" />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatInterval(expense.recurringInterval || "monthly")}
                            </span>
                          </div>
                          <span className="font-medium text-red-500">-{formatAmount(expense.amount)}</span>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">Letzte Ausführung</span>
                            <span>{format(new Date(expense.date), "dd.MM.yyyy", { locale: de })}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-medium">Nächste Ausführung</span>
                            <span>
                              {expense.recurringConfig?.isPaused
                                ? "Pausiert"
                                : getNextDate(expense.date, expense.recurringInterval || "monthly")}
                            </span>
                          </div>
                        </div>

                        {getRecurringConfigDetails(expense)}

                        <div className="flex flex-wrap gap-2 mt-2">
                          {category && (
                            <Badge style={{ backgroundColor: category.color, color: "#fff" }}>{category.name}</Badge>
                          )}
                          {account && (
                            <Badge variant="outline" style={{ borderColor: account.color, color: account.color }}>
                              {account.name}
                            </Badge>
                          )}
                          {person && (
                            <Badge variant="outline" style={{ borderColor: person.color, color: person.color }}>
                              {person.name}
                            </Badge>
                          )}
                        </div>

                        {expense.notes && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Notizen:</span> {expense.notes}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Income Dialog */}
      <Dialog open={isEditIncomeDialogOpen} onOpenChange={setIsEditIncomeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Wiederkehrende Einnahme bearbeiten</DialogTitle>
            <DialogDescription>Bearbeiten Sie die Details der wiederkehrenden Einnahme.</DialogDescription>
          </DialogHeader>
          {currentIncome && <IncomeForm income={currentIncome} onSuccess={() => setIsEditIncomeDialogOpen(false)} />}
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditExpenseDialogOpen} onOpenChange={setIsEditExpenseDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Wiederkehrende Ausgabe bearbeiten</DialogTitle>
            <DialogDescription>Bearbeiten Sie die Details der wiederkehrenden Ausgabe.</DialogDescription>
          </DialogHeader>
          {currentExpense && (
            <ExpenseForm expense={currentExpense} onSuccess={() => setIsEditExpenseDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
