"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Account } from "@/types/finance"

interface AccountFormProps {
  account?: Account
  onSuccess: () => void
}

const getDefaultAccountName = (type: string, accounts: Account[]) => {
  const typeAccounts = accounts.filter((account) => account.type === type)
  const count = typeAccounts.length + 1

  switch (type) {
    case "checking":
      return `Girokonto ${count}`
    case "savings":
      return `Sparkonto ${count}`
    case "cash":
      return `Bargeld ${count}`
    case "credit":
      return `Kreditkarte ${count}`
    case "investment":
      return `Investition ${count}`
    default:
      return `Konto ${count}`
  }
}

export function AccountForm({ account, onSuccess }: AccountFormProps) {
  const { addAccount, updateAccount, data } = useFinance()

  const [formData, setFormData] = useState({
    id: account?.id || "",
    name: account?.name || "",
    type: account?.type || "checking",
    balance: account?.balance?.toString() || "0",
    color: account?.color || "#3B82F6",
    icon: account?.icon || "",
    defaultForPersonIds: account?.defaultForPersonIds || [],
    ownerId: account?.ownerId || "",
    bankName: account?.bankName || "",
  })

  useEffect(() => {
    if (!account && formData.name === "") {
      setFormData((prev) => ({
        ...prev,
        name: getDefaultAccountName(formData.type, data.accounts),
      }))
    }
  }, [formData.type, account, data.accounts])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const accountData = {
      ...formData,
      balance: Number.parseFloat(formData.balance),
    }

    if (account) {
      updateAccount(accountData as Account)
    } else {
      addAccount(accountData)
    }

    onSuccess()
  }

  // Funktion zum Umschalten des Standard-Kontos für eine Person
  const toggleDefaultForPerson = (personId: string) => {
    setFormData((prev) => {
      const defaultForPersonIds = [...prev.defaultForPersonIds]
      const index = defaultForPersonIds.indexOf(personId)

      if (index === -1) {
        defaultForPersonIds.push(personId)
      } else {
        defaultForPersonIds.splice(index, 1)
      }

      return {
        ...prev,
        defaultForPersonIds,
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Kontotyp</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value as Account["type"] })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Kontotyp wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="checking">Girokonto</SelectItem>
            <SelectItem value="savings">Sparkonto</SelectItem>
            <SelectItem value="cash">Bargeld</SelectItem>
            <SelectItem value="credit">Kreditkarte</SelectItem>
            <SelectItem value="investment">Investition</SelectItem>
            <SelectItem value="other">Sonstiges</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner">Besitzer</Label>
        <Select value={formData.ownerId} onValueChange={(value) => setFormData({ ...formData, ownerId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Besitzer wählen (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nicht angegeben</SelectItem>
            {data.people.map((person) => (
              <SelectItem key={person.id} value={person.id}>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: person.color }} />
                  {person.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bankName">Bank</Label>
        <Input
          id="bankName"
          value={formData.bankName}
          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
          placeholder="z.B. UBS, Credit Suisse, Raiffeisen (optional)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="balance">Kontostand</Label>
        <Input
          id="balance"
          type="number"
          step="0.01"
          value={formData.balance}
          onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Farbe</Label>
        <div className="flex gap-2">
          <Input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-12 h-10 p-1"
            required
          />
          <Input
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="flex-1"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Standard-Konto für:</Label>
        <div className="space-y-2 border rounded-md p-3">
          {data.people.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Personen verfügbar</p>
          ) : (
            data.people.map((person) => (
              <div key={person.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`default-for-${person.id}`}
                  checked={formData.defaultForPersonIds.includes(person.id)}
                  onCheckedChange={() => toggleDefaultForPerson(person.id)}
                />
                <Label htmlFor={`default-for-${person.id}`} className="flex items-center cursor-pointer">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: person.color }} />
                  <span>Standard-Konto für {person.name}</span>
                </Label>
              </div>
            ))
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Wenn ein Konto als Standard für eine Person festgelegt ist, wird es automatisch bei neuen Transaktionen für
          diese Person ausgewählt.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Abbrechen
        </Button>
        <Button type="submit">{account ? "Aktualisieren" : "Hinzufügen"}</Button>
      </div>
    </form>
  )
}
