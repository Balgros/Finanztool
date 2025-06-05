"use client"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { AccountForm } from "@/components/forms/account-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Pencil, Trash, CreditCard, PiggyBank, Wallet, Briefcase, User, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Account } from "@/types/finance"
import { Badge } from "@/components/ui/badge"

export function AccountManager() {
  const { data, deleteAccount, formatCurrency } = useFinance()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null)

  const handleEditAccount = (account: Account) => {
    setCurrentAccount(account)
    setIsEditDialogOpen(true)
  }

  const handleDeleteAccount = (id: string) => {
    if (window.confirm("Möchtest du dieses Konto wirklich löschen?")) {
      deleteAccount(id)
    }
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "checking":
        return <CreditCard className="h-5 w-5" />
      case "savings":
        return <PiggyBank className="h-5 w-5" />
      case "cash":
        return <Wallet className="h-5 w-5" />
      case "investment":
        return <Briefcase className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const getAccountTypeName = (type: string) => {
    switch (type) {
      case "checking":
        return "Girokonto"
      case "savings":
        return "Sparkonto"
      case "cash":
        return "Bargeld"
      case "credit":
        return "Kreditkarte"
      case "investment":
        return "Investition"
      default:
        return "Sonstiges"
    }
  }

  const countAccountsByType = (type: string) => {
    return data.accounts.filter((account) => account.type === type).length
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Konten</h1>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline">Girokonten: {countAccountsByType("checking")}</Badge>
          <Badge variant="outline">Sparkonten: {countAccountsByType("savings")}</Badge>
          <Badge variant="outline">Bargeld: {countAccountsByType("cash")}</Badge>
          <Badge variant="outline">Kreditkarten: {countAccountsByType("credit")}</Badge>
          <Badge variant="outline">Investitionen: {countAccountsByType("investment")}</Badge>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Neues Konto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.accounts.map((account) => {
          const ownerName = getOwnerName(account.ownerId)
          const defaultForPersons = getDefaultForPersons(account.defaultForPersonIds || [])

          return (
            <Card key={account.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full" style={{ backgroundColor: account.color + "33" }}>
                      {getAccountIcon(account.type)}
                    </div>
                    <CardTitle>{account.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditAccount(account)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAccount(account.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{getAccountTypeName(account.type)}</span>
                  <span className={`text-xl font-bold ${account.balance >= 0 ? "income-text" : "expense-text"}`}>
                    {formatCurrency(account.balance)}
                  </span>
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
              </CardContent>
            </Card>
          )
        })}
      </div>

      {data.accounts.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Gesamtvermögen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(data.accounts.reduce((sum, account) => sum + account.balance, 0))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Account Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Neues Konto hinzufügen</DialogTitle>
          </DialogHeader>
          <AccountForm onSuccess={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Konto bearbeiten</DialogTitle>
          </DialogHeader>
          {currentAccount && <AccountForm account={currentAccount} onSuccess={() => setIsEditDialogOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
