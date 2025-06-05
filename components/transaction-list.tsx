"use client"

import { useFinance } from "@/context/finance-context"
import type { Transaction } from "@/types/finance"
import { ArrowDownCircle, ArrowUpCircle, Edit, Trash, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TransactionListProps {
  transactions: Transaction[]
  limit?: number
  onEdit?: (transaction: Transaction) => void
  onDelete?: (id: string) => void
}

export function TransactionList({ transactions, limit, onEdit, onDelete }: TransactionListProps) {
  const { getCategoryById, getPersonById, getAccountById, formatCurrency, data } = useFinance()

  // Füge eine Fehlerbehandlung hinzu
  if (!transactions || !Array.isArray(transactions)) {
    return <div className="text-center py-4 text-muted-foreground">Keine Transaktionen im ausgewählten Zeitraum.</div>
  }

  const displayTransactions = limit ? transactions.slice(0, limit) : transactions

  const isIncome = (transactionId: string) => {
    return "incomes" in data && data.incomes.some((i) => i.id === transactionId)
  }

  if (displayTransactions.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">Keine Transaktionen im ausgewählten Zeitraum.</div>
  }

  return (
    <div className="space-y-4">
      {displayTransactions.map((transaction) => {
        const category = getCategoryById(transaction.categoryId)
        const person = getPersonById(transaction.personId)
        const account = getAccountById(transaction.accountId)
        const incomeStatus = isIncome(transaction.id)

        return (
          <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-full ${incomeStatus ? "bg-[hsl(var(--income))]" : "bg-[hsl(var(--expense))]"} bg-opacity-20`}
              >
                {incomeStatus ? (
                  <ArrowUpCircle className="h-5 w-5 income-text" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5 expense-text" />
                )}
              </div>
              <div>
                <div className="font-medium flex items-center gap-2">
                  {transaction.description}
                  {transaction.isRecurring && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <RefreshCw className="h-4 w-4 text-muted-foreground inline-block" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Wiederkehrende Transaktion ({transaction.recurringInterval})</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(transaction.date), "dd.MM.yyyy", { locale: de })}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className={`font-medium ${incomeStatus ? "income-text" : "expense-text"}`}>
                {incomeStatus ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                {category && <Badge style={{ backgroundColor: category.color, color: "#fff" }}>{category.name}</Badge>}
                {person && (
                  <Badge variant="outline" style={{ borderColor: person.color, color: person.color }}>
                    {person.name}
                  </Badge>
                )}
                {account && (
                  <Badge variant="outline" style={{ borderColor: account.color, color: account.color }}>
                    {account.name}
                  </Badge>
                )}
                {transaction.isRecurring && (
                  <Badge variant="outline" className="bg-opacity-20 border-blue-500 text-blue-500">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {transaction.recurringInterval === "weekly" && "Wöchentlich"}
                    {transaction.recurringInterval === "monthly" && "Monatlich"}
                    {transaction.recurringInterval === "quarterly" && "Vierteljährlich"}
                    {transaction.recurringInterval === "yearly" && "Jährlich"}
                  </Badge>
                )}
              </div>
              {(onEdit || onDelete) && (
                <div className="flex gap-1 mt-2">
                  {onEdit && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => onEdit(transaction)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Bearbeiten</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {onDelete && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => onDelete(transaction.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Löschen</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
