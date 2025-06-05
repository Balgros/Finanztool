export type Currency = "CHF" | "EUR" | "USD"

export interface Income {
  id: string
  amount: number
  description: string
  date: string
  categoryId: string
  accountId: string
  personId?: string
  isRecurring?: boolean
}

export interface Expense {
  id: string
  amount: number
  description: string
  date: string
  categoryId: string
  accountId: string
  personId?: string
  isRecurring?: boolean
}

export interface Transfer {
  id: string
  amount: number
  description: string
  date: string
  fromAccountId: string
  toAccountId: string
}
