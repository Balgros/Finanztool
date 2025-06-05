"use client"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { CreditCard, PiggyBank, Wallet, Briefcase, User, Building2, ArrowRightLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TransferForm } from "@/components/forms/transfer-form"

export function AccountSummary() {
  const { data, formatCurrency } = useFinance()
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "checking":
        return <CreditCard className="h-4 w-4" />
      case "savings":
        return <PiggyBank className="h-4 w-4" />
      case "cash":
        return <Wallet className="h-4 w-4" />
      case "investment":
        return <Briefcase className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  // Funktion zum Öffnen des Transfer-Dialogs mit vorausgewähltem Konto
  const handleTransferClick = (accountId: string) => {
    setSelectedAccountId(accountId)
    setIsTransferDialogOpen(true)
  }

  // Funktion zum Abrufen des Besitzernamens
  const getOwnerName = (ownerId?: string) => {
    if (!ownerId) return null
    const owner = data.people.find((person) => person.id === ownerId)
    return owner ? owner.name : null
  }

  // Funktion zum Abrufen der Personen, für die dieses Konto Standard ist
  const getDefaultForPersons = (defaultForPersonIds: string[]) => {
    return data.people.filter((person) => defaultForPersonIds.includes(person.id))
  }

  // Berechne den Gesamtkontostand mit Fehlerbehandlung
  let totalBalance = 0
  try {
    totalBalance = data.accounts.reduce((sum, account) => sum + account.balance, 0)
  } catch (error) {
    console.error("Fehler beim Berechnen des Gesamtkontostands:", error)
  }

  // Berechne den Prozentsatz jedes Kontos am Gesamtkontostand mit Fehlerbehandlung
  const accountsWithPercentage = data.accounts.map((account) => {
    try {
      const balance = account.balance || 0
      const percentage = totalBalance > 0 ? (balance / totalBalance) * 100 : 0
      return {
        ...account,
        balance,
        percentage,
      }
    } catch (error) {
      console.error("Fehler beim Berechnen des Prozentsatzes für Konto:", error)
      return {
        ...account,
        balance: 0,
        percentage: 0,
      }
    }
  })

  return (
    <div className="space-y-4">
      {data.accounts.map((account) => {
        const ownerName = getOwnerName(account.ownerId)
        const defaultForPersons = getDefaultForPersons(account.defaultForPersonIds || [])

        return (
          <div key={account.id} className="flex flex-col p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full" style={{ backgroundColor: account.color + "33" }}>
                  {getAccountIcon(account.type)}
                </div>
                <div>
                  <div className="font-medium">{account.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{account.type}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleTransferClick(account.id)}>
                  <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Übertrag</span>
                </Button>
                <div
                  className={cn(
                    "font-medium",
                    account.balance > 0 ? "income-text" : account.balance < 0 ? "expense-text" : "",
                  )}
                >
                  {formatCurrency(account.balance)}
                </div>
              </div>
            </div>

            {/* Tags für Besitzer, Bank und Standard-Konto */}
            <div className="flex flex-wrap gap-1 mt-2">
              {ownerName && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <User className="h-3 w-3" /> {ownerName}
                </Badge>
              )}

              {account.bankName && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <Building2 className="h-3 w-3" /> {account.bankName}
                </Badge>
              )}

              {defaultForPersons.map((person) => (
                <Badge key={person.id} className="bg-primary/10 text-primary text-xs">
                  Standard für {person.name}
                </Badge>
              ))}
            </div>
          </div>
        )
      })}

      <div className="flex items-center justify-between p-3 rounded-lg border bg-muted">
        <div className="font-medium">Gesamtvermögen</div>
        <div
          className={cn(
            "font-medium",
            data.accounts.reduce((sum, account) => sum + account.balance, 0) > 0 ? "income-text" : "expense-text",
          )}
        >
          {formatCurrency(data.accounts.reduce((sum, account) => sum + account.balance, 0))}
        </div>
      </div>

      {/* Transfer Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Kontoübertrag</DialogTitle>
          </DialogHeader>
          <TransferForm
            onSuccess={() => setIsTransferDialogOpen(false)}
            initialFromAccountId={selectedAccountId || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
