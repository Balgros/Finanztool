"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Income, Expense, Transfer, Currency, RecurringConfig } from "@/types/finance" // RecurringConfig importiert
import {
  format,
  isWithinInterval,
  subMonths,
  startOfMonth,
  endOfMonth,
  addWeeks,
  addMonths,
  addYears,
  parseISO,
  isBefore,
  isEqual,
} from "date-fns"

interface Account {
  id: string
  name: string
  type: "checking" | "savings" | "credit" | "investment" | "cash"
  balance: number
  color: string
  bankName?: string
  ownerId?: string
  defaultForPersonIds?: string[]
}

interface Category {
  id: string
  name: string
  type: "income" | "expense"
  color: string
}

interface Person {
  id: string
  name: string
  email: string // Behalten für potenzielle zukünftige Nutzung (z.B. Einladungen)
  color: string
}

interface Budget {
  id: string
  categoryId: string
  amount: number
  period: "monthly" | "yearly"
}

interface Settings {
  currency: Currency
  language: string // z.B. 'de', 'en'
  theme: string // z.B. 'light', 'dark', 'system'
}

interface FinanceData {
  incomes: Income[]
  expenses: Expense[]
  transfers: Transfer[]
  accounts: Account[]
  categories: Category[]
  people: Person[]
  budgets: Budget[]
  settings: Settings
}

interface TimeRange {
  from: Date
  to: Date
}

interface FinanceContextType {
  data: FinanceData
  timeRange: TimeRange
  setTimeRange: (range: TimeRange) => void

  addIncome: (income: Omit<Income, "id" | "parentIncomeId">) => void
  updateIncome: (income: Income) => void
  deleteIncome: (id: string) => void

  addExpense: (expense: Omit<Expense, "id" | "parentExpenseId">) => void
  updateExpense: (expense: Expense) => void
  deleteExpense: (id: string) => void

  addTransfer: (transfer: Omit<Transfer, "id" | "parentTransferId">) => void
  updateTransfer: (transfer: Transfer) => void
  deleteTransfer: (id: string) => void

  addAccount: (account: Omit<Account, "id">) => void
  updateAccount: (account: Account) => void
  deleteAccount: (id: string) => void

  addCategory: (category: Omit<Category, "id">) => void
  updateCategory: (category: Category) => void
  deleteCategory: (id: string) => void

  addPerson: (person: Omit<Person, "id">) => void
  updatePerson: (person: Person) => void
  deletePerson: (id: string) => void

  addBudget: (budget: Omit<Budget, "id">) => void
  updateBudget: (budget: Budget) => void
  deleteBudget: (id: string) => void

  updateSettings: (settings: Partial<Settings>) => void

  getFilteredIncomes: () => Income[]
  getFilteredExpenses: () => Expense[]
  getFilteredTransfers: () => Transfer[]
  getTotalIncomes: (filtered?: boolean) => number
  getTotalExpenses: (filtered?: boolean) => number
  getBalance: (filtered?: boolean) => number
  getSavingsRate: (filtered?: boolean) => number

  getExpensesByCategory: () => Record<string, number>
  getIncomesByCategory: () => Record<string, number>
  getExpensesByAccount: () => Record<string, number>
  getIncomesByAccount: () => Record<string, number>
  getExpensesByPerson: () => Record<string, number>
  getIncomesByPerson: () => Record<string, number>
  getMonthlyExpenseTrend: () => Array<{ month: string; amount: number }>
  getMonthlyIncomeTrend: () => Array<{ month: string; amount: number }>

  getCategoryById: (id: string) => Category | undefined
  getPersonById: (id: string) => Person | undefined
  getAccountById: (id: string) => Account | undefined
  formatCurrency: (amount: number) => string

  generateAllRecurringTransactions: () => { incomes: number; expenses: number; transfers: number }

  exportData: () => string
  importData: (jsonData: string) => void
  resetData: () => void

  // Simple transaction management (legacy, consider removing or integrating)
  transactions: Transaction[] // This seems to be a simplified, separate transaction list
  addTransaction: (transaction: Omit<Transaction, "id">) => void
  removeTransaction: (id: string) => void
  getIncomes: () => Transaction[] // This refers to the simple transactions
  getExpenses: () => Transaction[] // This refers to the simple transactions
  getTotalIncome: () => number // This refers to the simple transactions
  getTotalExpense: () => number // This refers to the simple transactions
}

// Simplified transaction type for the legacy part
interface Transaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  date: string
}

const defaultData: FinanceData = {
  incomes: [],
  expenses: [],
  transfers: [],
  accounts: [
    {
      id: "acc-default-checking",
      name: "Girokonto",
      type: "checking",
      balance: 1250.75,
      color: "#3b82f6",
      bankName: "Meine Bank",
    },
    { id: "acc-default-savings", name: "Sparkonto", type: "savings", balance: 5300.0, color: "#10b981" },
    { id: "acc-default-cash", name: "Bargeld", type: "cash", balance: 180.5, color: "#f59e0b" },
  ],
  categories: [
    { id: "cat-default-salary", name: "Gehalt", type: "income", color: "#10b981" },
    { id: "cat-default-groceries", name: "Lebensmittel", type: "expense", color: "#ef4444" },
    { id: "cat-default-rent", name: "Miete", type: "expense", color: "#d946ef" },
    { id: "cat-default-invest", name: "Investitionen", type: "income", color: "#06b6d4" },
  ],
  people: [{ id: "person-default-self", name: "Ich", email: "ich@example.com", color: "#8b5cf6" }],
  budgets: [{ id: "budget-default-groceries", categoryId: "cat-default-groceries", amount: 400, period: "monthly" }],
  settings: {
    currency: "CHF",
    language: "de",
    theme: "system",
  },
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FinanceData>(defaultData)
  const [timeRange, setTimeRange] = useState<TimeRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  // Legacy simple transactions - consider phasing out or integrating
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2)

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("financeDataV2") // Changed key to avoid conflicts with old structure
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        // Merge parsedData with defaultData to ensure all keys exist, especially new ones like 'people'
        const mergedData = {
          ...defaultData,
          ...parsedData,
          settings: { ...defaultData.settings, ...parsedData.settings },
          // Ensure arrays are not undefined
          incomes: parsedData.incomes || [],
          expenses: parsedData.expenses || [],
          transfers: parsedData.transfers || [],
          accounts: parsedData.accounts || defaultData.accounts,
          categories: parsedData.categories || defaultData.categories,
          people: parsedData.people || defaultData.people,
          budgets: parsedData.budgets || [],
        }
        setData(mergedData)
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("financeDataV2", JSON.stringify(data))
    } catch (error) {
      console.error("Error saving data to localStorage:", error)
    }
  }, [data])

  // Legacy simple transactions storage
  useEffect(() => {
    const saved = localStorage.getItem("simple-finance-data")
    if (saved) {
      try {
        setTransactions(JSON.parse(saved))
      } catch (e) {
        console.error("Error loading simple transactions", e)
      }
    }
  }, [])
  useEffect(() => {
    localStorage.setItem("simple-finance-data", JSON.stringify(transactions))
  }, [transactions])

  const addIncome = useCallback((income: Omit<Income, "id" | "parentIncomeId">) => {
    const newIncome: Income = { ...income, id: generateId() }
    setData((prev) => ({
      ...prev,
      incomes: [...prev.incomes, newIncome].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
    }))
  }, [])
  const updateIncome = useCallback((updatedIncome: Income) => {
    setData((prev) => ({
      ...prev,
      incomes: prev.incomes
        .map((i) => (i.id === updatedIncome.id ? updatedIncome : i))
        .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
    }))
  }, [])
  const deleteIncome = useCallback((id: string) => {
    setData((prev) => ({ ...prev, incomes: prev.incomes.filter((i) => i.id !== id) }))
  }, [])

  const addExpense = useCallback((expense: Omit<Expense, "id" | "parentExpenseId">) => {
    const newExpense: Expense = { ...expense, id: generateId() }
    setData((prev) => ({
      ...prev,
      expenses: [...prev.expenses, newExpense].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
    }))
  }, [])
  const updateExpense = useCallback((updatedExpense: Expense) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses
        .map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
        .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
    }))
  }, [])
  const deleteExpense = useCallback((id: string) => {
    setData((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== id) }))
  }, [])

  const addTransfer = useCallback((transfer: Omit<Transfer, "id" | "parentTransferId">) => {
    const newTransfer: Transfer = { ...transfer, id: generateId() }
    setData((prev) => ({
      ...prev,
      transfers: [...prev.transfers, newTransfer].sort(
        (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime(),
      ),
    }))
  }, [])
  const updateTransfer = useCallback((updatedTransfer: Transfer) => {
    setData((prev) => ({
      ...prev,
      transfers: prev.transfers
        .map((t) => (t.id === updatedTransfer.id ? updatedTransfer : t))
        .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
    }))
  }, [])
  const deleteTransfer = useCallback((id: string) => {
    setData((prev) => ({ ...prev, transfers: prev.transfers.filter((t) => t.id !== id) }))
  }, [])

  const addAccount = useCallback((account: Omit<Account, "id">) => {
    const newAccount: Account = { ...account, id: generateId() }
    setData((prev) => ({ ...prev, accounts: [...prev.accounts, newAccount] }))
  }, [])
  const updateAccount = useCallback((updatedAccount: Account) => {
    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === updatedAccount.id ? updatedAccount : a)),
    }))
  }, [])
  const deleteAccount = useCallback((id: string) => {
    setData((prev) => ({ ...prev, accounts: prev.accounts.filter((a) => a.id !== id) }))
  }, [])

  const addCategory = useCallback((category: Omit<Category, "id">) => {
    const newCategory: Category = { ...category, id: generateId() }
    setData((prev) => ({ ...prev, categories: [...prev.categories, newCategory] }))
  }, [])
  const updateCategory = useCallback((updatedCategory: Category) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === updatedCategory.id ? updatedCategory : c)),
    }))
  }, [])
  const deleteCategory = useCallback((id: string) => {
    setData((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.id !== id) }))
  }, [])

  const addPerson = useCallback((person: Omit<Person, "id">) => {
    const newPerson: Person = { ...person, id: generateId() }
    setData((prev) => ({ ...prev, people: [...prev.people, newPerson] }))
  }, [])
  const updatePerson = useCallback((updatedPerson: Person) => {
    setData((prev) => ({ ...prev, people: prev.people.map((p) => (p.id === updatedPerson.id ? updatedPerson : p)) }))
  }, [])
  const deletePerson = useCallback((id: string) => {
    setData((prev) => ({ ...prev, people: prev.people.filter((p) => p.id !== id) }))
  }, [])

  const addBudget = useCallback((budget: Omit<Budget, "id">) => {
    const newBudget: Budget = { ...budget, id: generateId() }
    setData((prev) => ({ ...prev, budgets: [...prev.budgets, newBudget] }))
  }, [])
  const updateBudget = useCallback((updatedBudget: Budget) => {
    setData((prev) => ({ ...prev, budgets: prev.budgets.map((b) => (b.id === updatedBudget.id ? updatedBudget : b)) }))
  }, [])
  const deleteBudget = useCallback((id: string) => {
    setData((prev) => ({ ...prev, budgets: prev.budgets.filter((b) => b.id !== id) }))
  }, [])

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, ...newSettings } }))
  }, [])

  const getFilteredIncomes = useCallback((): Income[] => {
    return data.incomes.filter((income) =>
      isWithinInterval(parseISO(income.date), { start: timeRange.from, end: timeRange.to }),
    )
  }, [data.incomes, timeRange])

  const getFilteredExpenses = useCallback((): Expense[] => {
    return data.expenses.filter((expense) =>
      isWithinInterval(parseISO(expense.date), { start: timeRange.from, end: timeRange.to }),
    )
  }, [data.expenses, timeRange])

  const getFilteredTransfers = useCallback((): Transfer[] => {
    return data.transfers.filter((transfer) =>
      isWithinInterval(parseISO(transfer.date), { start: timeRange.from, end: timeRange.to }),
    )
  }, [data.transfers, timeRange])

  const getTotalIncomes = useCallback(
    (filtered = true): number => {
      const incomesToSum = filtered ? getFilteredIncomes() : data.incomes
      return incomesToSum.reduce((sum, income) => sum + income.amount, 0)
    },
    [getFilteredIncomes, data.incomes],
  )

  const getTotalExpenses = useCallback(
    (filtered = true): number => {
      const expensesToSum = filtered ? getFilteredExpenses() : data.expenses
      return expensesToSum.reduce((sum, expense) => sum + expense.amount, 0)
    },
    [getFilteredExpenses, data.expenses],
  )

  const getBalance = useCallback(
    (filtered = true): number => {
      return getTotalIncomes(filtered) - getTotalExpenses(filtered)
    },
    [getTotalIncomes, getTotalExpenses],
  )

  const getSavingsRate = useCallback(
    (filtered = true): number => {
      const totalIncomes = getTotalIncomes(filtered)
      if (totalIncomes === 0) return 0
      return (getBalance(filtered) / totalIncomes) * 100
    },
    [getTotalIncomes, getBalance],
  )

  const getExpensesByCategory = useCallback(() => {
    const expenses = getFilteredExpenses()
    const categoryTotals: Record<string, number> = {}
    expenses.forEach((exp) => {
      const catName = getCategoryById(exp.categoryId)?.name || "Unbekannt"
      categoryTotals[catName] = (categoryTotals[catName] || 0) + exp.amount
    })
    return categoryTotals
  }, [getFilteredExpenses, data.categories])

  const getIncomesByCategory = useCallback(() => {
    const incomes = getFilteredIncomes()
    const categoryTotals: Record<string, number> = {}
    incomes.forEach((inc) => {
      const catName = getCategoryById(inc.categoryId)?.name || "Unbekannt"
      categoryTotals[catName] = (categoryTotals[catName] || 0) + inc.amount
    })
    return categoryTotals
  }, [getFilteredIncomes, data.categories])

  const getExpensesByAccount = useCallback(() => {
    const expenses = getFilteredExpenses()
    const accountTotals: Record<string, number> = {}
    expenses.forEach((exp) => {
      const accName = getAccountById(exp.accountId)?.name || "Unbekannt"
      accountTotals[accName] = (accountTotals[accName] || 0) + exp.amount
    })
    return accountTotals
  }, [getFilteredExpenses, data.accounts])

  const getIncomesByAccount = useCallback(() => {
    const incomes = getFilteredIncomes()
    const accountTotals: Record<string, number> = {}
    incomes.forEach((inc) => {
      const accName = getAccountById(inc.accountId)?.name || "Unbekannt"
      accountTotals[accName] = (accountTotals[accName] || 0) + inc.amount
    })
    return accountTotals
  }, [getFilteredIncomes, data.accounts])

  const getExpensesByPerson = useCallback(() => {
    const expenses = getFilteredExpenses()
    const personTotals: Record<string, number> = {}
    expenses.forEach((exp) => {
      const personName = getPersonById(exp.personId)?.name || "Unbekannt"
      personTotals[personName] = (personTotals[personName] || 0) + exp.amount
    })
    return personTotals
  }, [getFilteredExpenses, data.people])

  const getIncomesByPerson = useCallback(() => {
    const incomes = getFilteredIncomes()
    const personTotals: Record<string, number> = {}
    incomes.forEach((inc) => {
      const personName = getPersonById(inc.personId)?.name || "Unbekannt"
      personTotals[personName] = (personTotals[personName] || 0) + inc.amount
    })
    return personTotals
  }, [getFilteredIncomes, data.people])

  const getMonthlyTrend = useCallback((items: Array<Income | Expense>) => {
    const trend: Array<{ month: string; amount: number }> = []
    for (let i = 5; i >= 0; i--) {
      const targetMonthStart = startOfMonth(subMonths(new Date(), i))
      const targetMonthEnd = endOfMonth(targetMonthStart)
      const amount = items
        .filter((item) => isWithinInterval(parseISO(item.date), { start: targetMonthStart, end: targetMonthEnd }))
        .reduce((sum, item) => sum + item.amount, 0)
      trend.push({ month: format(targetMonthStart, "MMM yyyy"), amount })
    }
    return trend
  }, [])

  const getMonthlyExpenseTrend = useCallback(() => getMonthlyTrend(data.expenses), [data.expenses, getMonthlyTrend])
  const getMonthlyIncomeTrend = useCallback(() => getMonthlyTrend(data.incomes), [data.incomes, getMonthlyTrend])

  const getCategoryById = useCallback((id: string) => data.categories.find((c) => c.id === id), [data.categories])
  const getPersonById = useCallback((id: string) => data.people.find((p) => p.id === id), [data.people])
  const getAccountById = useCallback((id: string) => data.accounts.find((a) => a.id === id), [data.accounts])

  const formatCurrency = useCallback(
    (amount: number): string => {
      return new Intl.NumberFormat("de-CH", { style: "currency", currency: data.settings.currency }).format(amount)
    },
    [data.settings.currency],
  )

  const generateAllRecurringTransactions = useCallback((): { incomes: number; expenses: number; transfers: number } => {
    let generatedIncomes = 0
    let generatedExpenses = 0
    const generatedTransfers = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Vergleiche nur Datum

    const newIncomes: Income[] = []
    data.incomes.forEach((income) => {
      if (
        income.isRecurring &&
        income.recurringInterval &&
        income.recurringConfig &&
        !income.recurringConfig.isPaused
      ) {
        let nextDate = parseISO(income.recurringConfig.startDate || income.date)
        if (income.recurringConfig.lastGenerated) {
          nextDate = parseISO(income.recurringConfig.lastGenerated)
          // Calculate next occurrence from lastGenerated
          switch (income.recurringInterval) {
            case "weekly":
              nextDate = addWeeks(nextDate, 1)
              break
            case "biweekly":
              nextDate = addWeeks(nextDate, 2)
              break
            case "monthly":
              nextDate = addMonths(nextDate, 1)
              break
            case "bimonthly":
              nextDate = addMonths(nextDate, 2)
              break
            case "quarterly":
              nextDate = addMonths(nextDate, 3)
              break
            case "semiannually":
              nextDate = addMonths(nextDate, 6)
              break
            case "yearly":
              nextDate = addYears(nextDate, 1)
              break
          }
        } else {
          // If no lastGenerated, start from startDate or original date
          nextDate = parseISO(income.recurringConfig.startDate || income.date)
          // If startDate is in the past, find first occurrence from today or future
          while (isBefore(nextDate, today) && !isEqual(nextDate, today)) {
            switch (income.recurringInterval) {
              case "weekly":
                nextDate = addWeeks(nextDate, 1)
                break
              // ... other intervals
              default:
                nextDate = addMonths(nextDate, 1)
                break // Default to monthly if needed
            }
          }
        }
        nextDate.setHours(0, 0, 0, 0)

        while (
          (isBefore(nextDate, today) || isEqual(nextDate, today)) &&
          (!income.recurringConfig.endDate ||
            isBefore(nextDate, parseISO(income.recurringConfig.endDate)) ||
            isEqual(nextDate, parseISO(income.recurringConfig.endDate))) &&
          (income.recurringConfig.occurrences === undefined || income.recurringConfig.occurrences > 0)
        ) {
          // Check if this specific date has already been generated by looking for parentIncomeId and date
          const alreadyGenerated = data.incomes.some(
            (existing) => existing.parentIncomeId === income.id && existing.date === format(nextDate, "yyyy-MM-dd"),
          )

          if (!alreadyGenerated) {
            newIncomes.push({
              ...income,
              id: generateId(),
              date: format(nextDate, "yyyy-MM-dd"),
              parentIncomeId: income.id,
              isRecurring: false, // Generated instance is not recurring itself
              recurringConfig: undefined, // Clear recurringConfig for instance
            })
            generatedIncomes++
            if (income.recurringConfig.occurrences !== undefined) {
              income.recurringConfig.occurrences--
            }
          }

          // Calculate next date for the loop
          switch (income.recurringInterval) {
            case "weekly":
              nextDate = addWeeks(nextDate, 1)
              break
            case "biweekly":
              nextDate = addWeeks(nextDate, 2)
              break
            case "monthly":
              nextDate = addMonths(nextDate, 1)
              break
            case "bimonthly":
              nextDate = addMonths(nextDate, 2)
              break
            case "quarterly":
              nextDate = addMonths(nextDate, 3)
              break
            case "semiannually":
              nextDate = addMonths(nextDate, 6)
              break
            case "yearly":
              nextDate = addYears(nextDate, 1)
              break
            default:
              break // Should not happen
          }
        }
        // Update lastGenerated for the original recurring income
        if (generatedIncomes > 0) {
          const originalIncomeIndex = data.incomes.findIndex((i) => i.id === income.id)
          if (originalIncomeIndex !== -1 && data.incomes[originalIncomeIndex].recurringConfig) {
            ;(data.incomes[originalIncomeIndex].recurringConfig as RecurringConfig).lastGenerated = format(
              today,
              "yyyy-MM-dd",
            )
          }
        }
      }
    })

    const newExpenses: Expense[] = []
    data.expenses.forEach((expense) => {
      // Similar logic for expenses
      if (
        expense.isRecurring &&
        expense.recurringInterval &&
        expense.recurringConfig &&
        !expense.recurringConfig.isPaused
      ) {
        let nextDate = parseISO(expense.recurringConfig.startDate || expense.date)
        if (expense.recurringConfig.lastGenerated) {
          nextDate = parseISO(expense.recurringConfig.lastGenerated)
          switch (expense.recurringInterval) {
            case "weekly":
              nextDate = addWeeks(nextDate, 1)
              break
            // ... other intervals
            default:
              nextDate = addMonths(nextDate, 1)
              break
          }
        } else {
          nextDate = parseISO(expense.recurringConfig.startDate || expense.date)
          while (isBefore(nextDate, today) && !isEqual(nextDate, today)) {
            switch (expense.recurringInterval) {
              case "weekly":
                nextDate = addWeeks(nextDate, 1)
                break
              // ... other intervals
              default:
                nextDate = addMonths(nextDate, 1)
                break
            }
          }
        }
        nextDate.setHours(0, 0, 0, 0)

        while (
          (isBefore(nextDate, today) || isEqual(nextDate, today)) &&
          (!expense.recurringConfig.endDate ||
            isBefore(nextDate, parseISO(expense.recurringConfig.endDate)) ||
            isEqual(nextDate, parseISO(expense.recurringConfig.endDate))) &&
          (expense.recurringConfig.occurrences === undefined || expense.recurringConfig.occurrences > 0)
        ) {
          const alreadyGenerated = data.expenses.some(
            (existing) => existing.parentExpenseId === expense.id && existing.date === format(nextDate, "yyyy-MM-dd"),
          )
          if (!alreadyGenerated) {
            newExpenses.push({
              ...expense,
              id: generateId(),
              date: format(nextDate, "yyyy-MM-dd"),
              parentExpenseId: expense.id,
              isRecurring: false,
              recurringConfig: undefined,
            })
            generatedExpenses++
            if (expense.recurringConfig.occurrences !== undefined) {
              expense.recurringConfig.occurrences--
            }
          }
          switch (expense.recurringInterval) {
            case "weekly":
              nextDate = addWeeks(nextDate, 1)
              break
            // ... other intervals
            default:
              nextDate = addMonths(nextDate, 1)
              break
          }
        }
        if (generatedExpenses > 0) {
          const originalExpenseIndex = data.expenses.findIndex((e) => e.id === expense.id)
          if (originalExpenseIndex !== -1 && data.expenses[originalExpenseIndex].recurringConfig) {
            ;(data.expenses[originalExpenseIndex].recurringConfig as RecurringConfig).lastGenerated = format(
              today,
              "yyyy-MM-dd",
            )
          }
        }
      }
    })

    // TODO: Implement recurring transfers generation
    // Similar logic as incomes and expenses

    if (newIncomes.length > 0 || newExpenses.length > 0) {
      setData((prev) => ({
        ...prev,
        incomes: [...prev.incomes, ...newIncomes].sort(
          (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime(),
        ),
        expenses: [...prev.expenses, ...newExpenses].sort(
          (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime(),
        ),
        // Update original recurring items with new lastGenerated date or occurrences count
        // This part needs careful handling to update the original recurring items in prev.incomes/prev.expenses
      }))
    }

    return { incomes: generatedIncomes, expenses: generatedExpenses, transfers: generatedTransfers }
  }, [data, setData])

  const exportData = useCallback(() => JSON.stringify(data, null, 2), [data])
  const importData = useCallback((jsonData: string) => {
    try {
      const importedData = JSON.parse(jsonData)
      // Basic validation or schema check could be added here
      setData({ ...defaultData, ...importedData, settings: { ...defaultData.settings, ...importedData.settings } })
    } catch (e) {
      console.error("Error importing data:", e)
    }
  }, [])
  const resetData = useCallback(() => {
    if (
      window.confirm("Möchten Sie wirklich alle Daten zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.")
    ) {
      setData(defaultData)
      localStorage.removeItem("financeDataV2")
      localStorage.removeItem("simple-finance-data") // Clear legacy too
    }
  }, [])

  // Legacy simple transaction functions
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = { ...transaction, id: generateId() }
    setTransactions((prev) => [...prev, newTransaction])
  }
  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }
  const getIncomes = () => transactions.filter((t) => t.type === "income")
  const getExpenses = () => transactions.filter((t) => t.type === "expense")
  const getTotalIncome = () => transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const getTotalExpense = () => transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const value: FinanceContextType = {
    data,
    timeRange,
    setTimeRange,
    addIncome,
    updateIncome,
    deleteIncome,
    addExpense,
    updateExpense,
    deleteExpense,
    addTransfer,
    updateTransfer,
    deleteTransfer,
    addAccount,
    updateAccount,
    deleteAccount,
    addCategory,
    updateCategory,
    deleteCategory,
    addPerson,
    updatePerson,
    deletePerson,
    addBudget,
    updateBudget,
    deleteBudget,
    updateSettings,
    getFilteredIncomes,
    getFilteredExpenses,
    getFilteredTransfers,
    getTotalIncomes,
    getTotalExpenses,
    getBalance,
    getSavingsRate,
    getExpensesByCategory,
    getIncomesByCategory,
    getExpensesByAccount,
    getIncomesByAccount,
    getExpensesByPerson,
    getIncomesByPerson,
    getMonthlyExpenseTrend,
    getMonthlyIncomeTrend,
    getCategoryById,
    getPersonById,
    getAccountById,
    formatCurrency,
    generateAllRecurringTransactions,
    exportData,
    importData,
    resetData,
    // Legacy simple transactions
    transactions,
    addTransaction,
    removeTransaction,
    getIncomes,
    getExpenses,
    getTotalIncome,
    getTotalExpense,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}
