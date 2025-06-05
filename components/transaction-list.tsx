"use client"

import { useFinance } from "@/context/finance-context"
import { ArrowDownCircle, ArrowUpCircle, Edit, Trash, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TransactionListProps {
  transactions: any[]
  limit?: number
  onEdit?: (transaction: any) => void
  onDelete?: (id: string) => void
}

export function TransactionList({ transactions, limit, onEdit, onDelete }: TransactionListProps) {
  const { getCategoryById, getPersonById, getAccountById, formatCurrency } = useFinance()

  // Fehlerbehandlung für ungültige Eingaben
  if (!transactions || !Array.isArray(transactions)) {
    return <div className="text-center py-4 text-muted-foreground">Keine Transaktionen verfügbar.</div>
  }

  const displayTransactions = limit ? transactions.slice(0, limit) : transactions

  if (displayTransactions.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">Keine Transaktionen im ausgewählten Zeitraum.</div>
  }

  return (
    <div className="space-y-3">
      {displayTransactions.map((transaction) => {
        // Bestimme den Transaktionstyp
        const isIncome = transaction.type === "income" || (!transaction.type && transaction.incomeType !== undefined)

        const category = getCategoryById(transaction.categoryId)
        const person = getPersonById(transaction.personId)
        const account = getAccountById(transaction.accountId)

        return (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-full ${
                  isIncome ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
                }`}
              >
                {isIncome ? (
                  <ArrowUpCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium flex items-center gap-2">
                  <span className="truncate">{transaction.description}</span>
                  {transaction.isRecurring && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <RefreshCw className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                  {account && <span className="ml-2">• {account.name}</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 ml-4">
              <div
                className={`font-semibold text-lg ${
                  isIncome ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {isIncome ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </div>

              <div className="flex flex-wrap gap-1 justify-end">
                {category && (
                  <Badge style={{ backgroundColor: category.color, color: "#fff" }} className="text-xs">
                    {category.name}
                  </Badge>
                )}
                {person && (
                  <Badge
                    variant="outline"
                    style={{ borderColor: person.color, color: person.color }}
                    className="text-xs"
                  >
                    {person.name}
                  </Badge>
                )}
                {transaction.isRecurring && (
                  <Badge variant="secondary" className="text-xs">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {transaction.recurringInterval === "weekly" && "Wöchentlich"}
                    {transaction.recurringInterval === "monthly" && "Monatlich"}
                    {transaction.recurringInterval === "quarterly" && "Vierteljährlich"}
                    {transaction.recurringInterval === "yearly" && "Jährlich"}
                  </Badge>
                )}
              </div>

              {(onEdit || onDelete) && (
                <div className="flex gap-1">
                  {onEdit && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => onEdit(transaction)}>
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
                          <Button variant="ghost" size="sm" onClick={() => onDelete(transaction.id)}>
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
