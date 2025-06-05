"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Income, Expense, Transfer, Currency } from "@/types/finance"
import { format, isWithinInterval, subMonths, startOfMonth, endOfMonth, addWeeks, addMonths, addYears } from "date-fns"

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
  email: string
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
  language: string
  theme: string
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

  // CRUD operations
  addIncome: (income: Omit<Income, "id">) => void
  updateIncome: (income: Income) => void
  deleteIncome: (id: string) => void

  addExpense: (expense: Omit<Expense, "id">) => void
  updateExpense: (expense: Expense) => void
  deleteExpense: (id: string) => void

  addTransfer: (transfer: Omit<Transfer, "id">) => void
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

  // Getter functions
  getFilteredIncomes: () => Income[]
  getFilteredExpenses: () => Expense[]
  getFilteredTransfers: () => Transfer[]
  getTotalIncomes: () => number
  getTotalExpenses: () => number
  getBalance: () => number
  getSavingsRate: () => number
  getExpensesByCategory: () => Record<string, number>
  getIncomesByCategory: () => Record<string, number>
  getExpensesByAccount: () => Record<string, number>
  getIncomesByAccount: () => Record<string, number>
  getExpensesByPerson: () => Record<string, number>
  getIncomesByPerson: () => Record<string, number>
  getMonthlyExpenseTrend: () => Array<{ month: string; amount: number }>
  getMonthlyIncomeTrend: () => Array<{ month: string; amount: number }>

  // Helper functions
  getCategoryById: (id: string) => Category | undefined
  getPersonById: (id: string) => Person | undefined
  getAccountById: (id: string) => Account | undefined
  formatCurrency: (amount: number) => string

  // Recurring transactions
  generateAllRecurringTransactions: () => { incomes: number; expenses: number }

  // Data management
  exportData: () => string
  importData: (jsonData: string) => void
  resetData: () => void

  // Simple transaction management
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, "id">) => void
  removeTransaction: (id: string) => void
  getIncomes: () => Transaction[]
  getExpenses: () => Transaction[]
  getTotalIncome: () => number
  getTotalExpense: () => number
}

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
      id: "1",
      name: "Girokonto",
      type: "checking",
      balance: 0,
      color: "#3b82f6",
    },
  ],
  categories: [
    {
      id: "1",
      name: "Gehalt",
      type: "income",
      color: "#10b981",
    },
    {
      id: "2",
      name: "Lebensmittel",
      type: "expense",
      color: "#ef4444",
    },
  ],
  people: [
    {
      id: "1",
      name: "Ich",
      email: "",
      color: "#8b5cf6",
    },
  ],
  budgets: [],
  settings: {
    currency: "CHF",
    language: "de",
    theme: "dark",
  },
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FinanceData>(defaultData)
  const [timeRange, setTimeRange] = useState<TimeRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("financeData")
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setData({ ...defaultData, ...parsedData })
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    }
  }, [])

  // Save data to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem("financeData", JSON.stringify(data))
    } catch (error) {
      console.error("Error saving data to localStorage:", error)
    }
  }, [data])

  useEffect(() => {
    const saved = localStorage.getItem("simple-finance-data")
    if (saved) {
      try {
        setTransactions(JSON.parse(saved))
      } catch (error) {
        console.error("Fehler beim Laden:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("simple-finance-data", JSON.stringify(transactions))
  }, [transactions])

  // Helper function to generate unique IDs
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  // CRUD operations for incomes
  const addIncome = useCallback((income: Omit<Income, "id">) => {
    const newIncome: Income = { ...income, id: generateId() }
    setData((prev) => ({ ...prev, incomes: [...prev.incomes, newIncome] }))
  }, [])

  const updateIncome = useCallback((income: Income) => {
    setData((prev) => ({
      ...prev,
      incomes: prev.incomes.map((i) => (i.id === income.id ? income : i)),
    }))
  }, [])

  const deleteIncome = useCallback((id: string) => {
    setData((prev) => ({ ...prev, incomes: prev.incomes.filter((income) => income.id !== id) }))
  }, [])

  // CRUD operations for expenses
  const addExpense = useCallback((expense: Omit<Expense, "id">) => {
    const newExpense: Expense = { ...expense, id: generateId() }
    setData((prev) => ({ ...prev, expenses: [...prev.expenses, newExpense] }))
  }, [])

  const updateExpense = useCallback((expense: Expense) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === expense.id ? expense : e)),
    }))
  }, [])

  const deleteExpense = useCallback((id: string) => {
    setData((prev) => ({ ...prev, expenses: prev.expenses.filter((expense) => expense.id !== id) }))
  }, [])

  // CRUD operations for transfers
  const addTransfer = useCallback((transfer: Omit<Transfer, "id">) => {
    const newTransfer: Transfer = { ...transfer, id: generateId() }
    setData((prev) => ({ ...prev, transfers: [...prev.transfers, newTransfer] }))
  }, [])

  const updateTransfer = useCallback((transfer: Transfer) => {
    setData((prev) => ({
      ...prev,
      transfers: prev.transfers.map((t) => (t.id === transfer.id ? transfer : t)),
    }))
  }, [])

  const deleteTransfer = useCallback((id: string) => {
    setData((prev) => ({ ...prev, transfers: prev.transfers.filter((transfer) => transfer.id !== id) }))
  }, [])

  // CRUD operations for accounts
  const addAccount = useCallback((account: Omit<Account, "id">) => {
    const newAccount: Account = { ...account, id: generateId() }
    setData((prev) => ({ ...prev, accounts: [...prev.accounts, newAccount] }))
  }, [])

  const updateAccount = useCallback((account: Account) => {
    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === account.id ? account : a)),
    }))
  }, [])

  const deleteAccount = useCallback((id: string) => {
    setData((prev) => ({ ...prev, accounts: prev.accounts.filter((account) => account.id !== id) }))
  }, [])

  // CRUD operations for categories
  const addCategory = useCallback((category: Omit<Category, "id">) => {
    const newCategory: Category = { ...category, id: generateId() }
    setData((prev) => ({ ...prev, categories: [...prev.categories, newCategory] }))
  }, [])

  const updateCategory = useCallback((category: Category) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === category.id ? category : c)),
    }))
  }, [])

  const deleteCategory = useCallback((id: string) => {
    setData((prev) => ({ ...prev, categories: prev.categories.filter((category) => category.id !== id) }))
  }, [])

  // CRUD operations for people
  const addPerson = useCallback((person: Omit<Person, "id">) => {
    const newPerson: Person = { ...person, id: generateId() }
    setData((prev) => ({ ...prev, people: [...prev.people, newPerson] }))
  }, [])

  const updatePerson = useCallback((person: Person) => {
    setData((prev) => ({
      ...prev,
      people: prev.people.map((p) => (p.id === person.id ? person : p)),
    }))
  }, [])

  const deletePerson = useCallback((id: string) => {
    setData((prev) => ({ ...prev, people: prev.people.filter((person) => person.id !== id) }))
  }, [])

  // CRUD operations for budgets
  const addBudget = useCallback((budget: Omit<Budget, "id">) => {
    const newBudget: Budget = { ...budget, id: generateId() }
    setData((prev) => ({ ...prev, budgets: [...prev.budgets, newBudget] }))
  }, [])

  const updateBudget = useCallback((budget: Budget) => {
    setData((prev) => ({
      ...prev,
      budgets: prev.budgets.map((b) => (b.id === budget.id ? budget : b)),
    }))
  }, [])

  const deleteBudget = useCallback((id: string) => {
    setData((prev) => ({ ...prev, budgets: prev.budgets.filter((budget) => budget.id !== id) }))
  }, [])

  // Getter functions with proper error handling
  const getFilteredIncomes = useCallback((): Income[] => {
    try {
      return data.incomes.filter((income) => {
        const incomeDate = new Date(income.date)
        return isWithinInterval(incomeDate, { start: timeRange.from, end: timeRange.to })
      })
    } catch (error) {
      console.error("Error filtering incomes:", error)
      return []
    }
  }, [data.incomes, timeRange])

  const getFilteredExpenses = useCallback((): Expense[] => {
    try {
      return data.expenses.filter((expense) => {
        const expenseDate = new Date(expense.date)
        return isWithinInterval(expenseDate, { start: timeRange.from, end: timeRange.to })
      })
    } catch (error) {
      console.error("Error filtering expenses:", error)
      return []
    }
  }, [data.expenses, timeRange])

  const getFilteredTransfers = useCallback((): Transfer[] => {
    try {
      return data.transfers.filter((transfer) => {
        const transferDate = new Date(transfer.date)
        return isWithinInterval(transferDate, { start: timeRange.from, end: timeRange.to })
      })
    } catch (error) {
      console.error("Error filtering transfers:", error)
      return []
    }
  }, [data.transfers, timeRange])

  const getTotalIncomes = useCallback((): number => {
    try {
      return getFilteredIncomes().reduce((sum, income) => sum + income.amount, 0)
    } catch (error) {
      console.error("Error calculating total incomes:", error)
      return 0
    }
  }, [getFilteredIncomes])

  const getTotalExpenses = useCallback((): number => {
    try {
      return getFilteredExpenses().reduce((sum, expense) => sum + expense.amount, 0)
    } catch (error) {
      console.error("Error calculating total expenses:", error)
      return 0
    }
  }, [getFilteredExpenses])

  const getBalance = useCallback((): number => {
    try {
      return getTotalIncomes() - getTotalExpenses()
    } catch (error) {
      console.error("Error calculating balance:", error)
      return 0
    }
  }, [getTotalIncomes, getTotalExpenses])

  const getSavingsRate = useCallback((): number => {
    try {
      const totalIncomes = getTotalIncomes()
      if (totalIncomes === 0) return 0
      return (getBalance() / totalIncomes) * 100
    } catch (error) {
      console.error("Error calculating savings rate:", error)
      return 0
    }
  }, [getTotalIncomes, getBalance])

  const getExpensesByCategory = useCallback((): Record<string, number> => {
    try {
      const expenses = getFilteredExpenses()
      const categoryTotals: Record<string, number> = {}

      expenses.forEach((expense) => {
        const category = getCategoryById(expense.categoryId)
        const categoryName = category?.name || "Unbekannt"
        categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + expense.amount
      })

      return categoryTotals
    } catch (error) {
      console.error("Error getting expenses by category:", error)
      return {}
    }
  }, [getFilteredExpenses, data.categories])

  const getIncomesByCategory = useCallback((): Record<string, number> => {
    try {
      const incomes = getFilteredIncomes()
      const categoryTotals: Record<string, number> = {}

      incomes.forEach((income) => {
        const category = getCategoryById(income.categoryId)
        const categoryName = category?.name || "Unbekannt"
        categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + income.amount
      })

      return categoryTotals
    } catch (error) {
      console.error("Error getting incomes by category:", error)
      return {}
    }
  }, [getFilteredIncomes, data.categories])

  const getExpensesByAccount = useCallback((): Record<string, number> => {
    try {
      const expenses = getFilteredExpenses()
      const accountTotals: Record<string, number> = {}

      expenses.forEach((expense) => {
        const account = getAccountById(expense.accountId)
        const accountName = account?.name || "Unbekannt"
        accountTotals[accountName] = (accountTotals[accountName] || 0) + expense.amount
      })

      return accountTotals
    } catch (error) {
      console.error("Error getting expenses by account:", error)
      return {}
    }
  }, [getFilteredExpenses, data.accounts])

  const getIncomesByAccount = useCallback((): Record<string, number> => {
    try {
      const incomes = getFilteredIncomes()
      const accountTotals: Record<string, number> = {}

      incomes.forEach((income) => {
        const account = getAccountById(income.accountId)
        const accountName = account?.name || "Unbekannt"
        accountTotals[accountName] = (accountTotals[accountName] || 0) + income.amount
      })

      return accountTotals
    } catch (error) {
      console.error("Error getting incomes by account:", error)
      return {}
    }
  }, [getFilteredIncomes, data.accounts])

  const getExpensesByPerson = useCallback((): Record<string, number> => {
    try {
      const expenses = getFilteredExpenses()
      const personTotals: Record<string, number> = {}

      expenses.forEach((expense) => {
        const person = getPersonById(expense.personId)
        const personName = person?.name || "Unbekannt"
        personTotals[personName] = (personTotals[personName] || 0) + expense.amount
      })

      return personTotals
    } catch (error) {
      console.error("Error getting expenses by person:", error)
      return {}
    }
  }, [getFilteredExpenses, data.people])

  const getIncomesByPerson = useCallback((): Record<string, number> => {
    try {
      const incomes = getFilteredIncomes()
      const personTotals: Record<string, number> = {}

      incomes.forEach((income) => {
        const person = getPersonById(income.personId)
        const personName = person?.name || "Unbekannt"
        personTotals[personName] = (personTotals[personName] || 0) + income.amount
      })

      return personTotals
    } catch (error) {
      console.error("Error getting incomes by person:", error)
      return {}
    }
  }, [getFilteredIncomes, data.people])

  const getMonthlyExpenseTrend = useCallback(() => {
    try {
      const months = []
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i)
        months.push({
          month: format(date, "MMM yyyy"),
          amount: data.expenses
            .filter((expense) => format(new Date(expense.date), "yyyy-MM") === format(date, "yyyy-MM"))
            .reduce((sum, expense) => sum + expense.amount, 0),
        })
      }
      return months
    } catch (error) {
      console.error("Error getting monthly expense trend:", error)
      return []
    }
  }, [data.expenses])

  const getMonthlyIncomeTrend = useCallback(() => {
    try {
      const months = []
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i)
        months.push({
          month: format(date, "MMM yyyy"),
          amount: data.incomes
            .filter((income) => format(new Date(income.date), "yyyy-MM") === format(date, "yyyy-MM"))
            .reduce((sum, income) => sum + income.amount, 0),
        })
      }
      return months
    } catch (error) {
      console.error("Error getting monthly income trend:", error)
      return []
    }
  }, [data.incomes])

  // Helper functions
  const getCategoryById = useCallback(
    (id: string) => {
      return data.categories.find((category) => category.id === id)
    },
    [data.categories],
  )

  const getPersonById = useCallback(
    (id: string) => {
      return data.people.find((person) => person.id === id)
    },
    [data.people],
  )

  const getAccountById = useCallback(
    (id: string) => {
      return data.accounts.find((account) => account.id === id)
    },
    [data.accounts],
  )

  const formatCurrency = useCallback(
    (amount: number): string => {
      try {
        return new Intl.NumberFormat("de-CH", {
          style: "currency",
          currency: data.settings.currency,
        }).format(amount)
      } catch (error) {
        console.error("Error formatting currency:", error)
        return `${amount} ${data.settings.currency}`
      }
    },
    [data.settings.currency],
  )

  // Recurring transactions
  const generateAllRecurringTransactions = useCallback((): { incomes: number; expenses: number } => {
    let generatedIncomes = 0
    let generatedExpenses = 0

    try {
      const today = new Date()

      // Generate recurring incomes
      data.incomes.forEach((income) => {
        if (income.isRecurring && income.recurringInterval && !income.recurringConfig?.isPaused) {
          const lastDate = new Date(income.date)
          let nextDate = new Date(lastDate)

          // Calculate next date based on interval
          switch (income.recurringInterval) {
            case "weekly":
              nextDate = addWeeks(lastDate, 1)
              break
            case "biweekly":
              nextDate = addWeeks(lastDate, 2)
              break
            case "monthly":
              nextDate = addMonths(lastDate, 1)
              break
            case "bimonthly":
              nextDate = addMonths(lastDate, 2)
              break
            case "quarterly":
              nextDate = addMonths(lastDate, 3)
              break
            case "semiannually":
              nextDate = addMonths(lastDate, 6)
              break
            case "yearly":
              nextDate = addYears(lastDate, 1)
              break
          }

          // If next date is today or in the past, generate new transaction
          if (nextDate <= today) {
            const newIncome: Income = {
              ...income,
              id: generateId(),
              date: format(nextDate, "yyyy-MM-dd"),
              parentIncomeId: income.id,
            }

            setData((prev) => ({
              ...prev,
              incomes: [...prev.incomes, newIncome],
            }))

            generatedIncomes++
          }
        }
      })

      // Generate recurring expenses
      data.expenses.forEach((expense) => {
        if (expense.isRecurring && expense.recurringInterval && !expense.recurringConfig?.isPaused) {
          const lastDate = new Date(expense.date)
          let nextDate = new Date(lastDate)

          // Calculate next date based on interval
          switch (expense.recurringInterval) {
            case "weekly":
              nextDate = addWeeks(lastDate, 1)
              break
            case "biweekly":
              nextDate = addWeeks(lastDate, 2)
              break
            case "monthly":
              nextDate = addMonths(lastDate, 1)
              break
            case "bimonthly":
              nextDate = addMonths(lastDate, 2)
              break
            case "quarterly":
              nextDate = addMonths(lastDate, 3)
              break
            case "semiannually":
              nextDate = addMonths(lastDate, 6)
              break
            case "yearly":
              nextDate = addYears(lastDate, 1)
              break
          }

          // If next date is today or in the past, generate new transaction
          if (nextDate <= today) {
            const newExpense: Expense = {
              ...expense,
              id: generateId(),
              date: format(nextDate, "yyyy-MM-dd"),
              parentExpenseId: expense.id,
            }

            setData((prev) => ({
              ...prev,
              expenses: [...prev.expenses, newExpense],
            }))

            generatedExpenses++
          }
        }
      })
    } catch (error) {
      console.error("Error generating recurring transactions:", error)
    }

    return { incomes: generatedIncomes, expenses: generatedExpenses }
  }, [data.incomes, data.expenses])

  // Data management
  const exportData = useCallback((): string => {
    try {
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error("Error exporting data:", error)
      return "{}"
    }
  }, [data])

  const importData = useCallback((jsonData: string) => {
    try {
      const importedData = JSON.parse(jsonData)
      setData({ ...defaultData, ...importedData })
    } catch (error) {
      console.error("Error importing data:", error)
    }
  }, [])

  const resetData = useCallback(() => {
    setData(defaultData)
    localStorage.removeItem("financeData")
  }, [])

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setTransactions((prev) => [...prev, newTransaction])
  }

  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const getIncomes = () => {
    return transactions.filter((t) => t.type === "income")
  }

  const getExpenses = () => {
    return transactions.filter((t) => t.type === "expense")
  }

  const getTotalIncome = () => {
    return transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  }

  const getTotalExpense = () => {
    return transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  }

  const value: FinanceContextType = {
    data,
    timeRange,
    setTimeRange,

    // CRUD operations
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

    // Getter functions
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

    // Helper functions
    getCategoryById,
    getPersonById,
    getAccountById,
    formatCurrency,

    // Recurring transactions
    generateAllRecurringTransactions,

    // Data management
    exportData,
    importData,
    resetData,

    // Simple transaction management
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
