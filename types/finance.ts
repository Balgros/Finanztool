export type Currency = "CHF" | "EUR" | "USD" // Beispielwährungen

export interface RecurringConfig {
  startDate?: string // ISO Date string
  endDate?: string // ISO Date string
  occurrences?: number // Anzahl der Wiederholungen
  isPaused?: boolean
  lastGenerated?: string // ISO Date string, wann die letzte Instanz generiert wurde
  dayOfMonth?: number // Für monatliche/jährliche Wiederholungen an einem bestimmten Tag
}

export interface TransactionBase {
  id: string
  description: string
  amount: number
  date: string // ISO Date string, z.B. "2023-10-26"
  categoryId: string
  accountId: string
  personId: string // Wer hat die Transaktion durchgeführt/erhalten
  notes?: string
  isRecurring?: boolean
  recurringInterval?:
    | "daily"
    | "weekly"
    | "biweekly"
    | "monthly"
    | "bimonthly"
    | "quarterly"
    | "semiannually"
    | "yearly"
  recurringConfig?: RecurringConfig
}

export interface Income extends TransactionBase {
  incomeType?: "salary" | "bonus" | "gift" | "investment" | "sideIncome" | "13thSalary" | "regular" | "other" // Detailliertere Einkommensarten
  parentIncomeId?: string // ID der ursprünglichen wiederkehrenden Einnahme
}

export interface Expense extends TransactionBase {
  expenseType?: "fixed" | "variable" | "discretionary" // Detailliertere Ausgabenarten
  parentExpenseId?: string // ID der ursprünglichen wiederkehrenden Ausgabe
}

export interface Transfer {
  id: string
  description: string
  amount: number
  date: string // ISO Date string
  fromAccountId: string
  toAccountId: string
  personId: string // Wer hat den Übertrag durchgeführt
  notes?: string
  isRecurring?: boolean
  recurringInterval?:
    | "daily"
    | "weekly"
    | "biweekly"
    | "monthly"
    | "bimonthly"
    | "quarterly"
    | "semiannually"
    | "yearly"
  recurringConfig?: RecurringConfig
  parentTransferId?: string // ID des ursprünglichen wiederkehrenden Übertrags
}

// Andere Typen bleiben wie zuvor (Account, Category, Person, Budget, Settings etc.)
// Diese sind bereits in finance-context.tsx definiert und müssen hier nicht wiederholt werden,
// es sei denn, sie werden von vielen externen Komponenten direkt importiert.
// Für Konsistenz könnten sie auch hier zentralisiert werden.
