"use client"

import type React from "react"
import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import type { Transfer, RecurringInterval } from "@/types/finance"
import { format, addDays, addMonths, addYears } from "date-fns"

interface TransferFormProps {
  transfer?: Transfer
  onSuccess: () => void
}

export function TransferForm({ transfer, onSuccess }: TransferFormProps) {
  const { data, addTransfer, updateTransfer } = useFinance()
  const today = new Date()

  const [formData, setFormData] = useState({
    id: transfer?.id || "",
    date: transfer?.date || format(today, "yyyy-MM-dd"),
    amount: transfer?.amount.toString() || "",
    description: transfer?.description || "",
    fromAccountId: transfer?.fromAccountId || "",
    toAccountId: transfer?.toAccountId || "",
    personId: transfer?.personId || "",
    notes: transfer?.notes || "",
    isRecurring: transfer?.isRecurring || false,
    recurringInterval: transfer?.recurringInterval || "monthly",
    recurringConfig: transfer?.recurringConfig || {
      startDate: transfer?.date || format(today, "yyyy-MM-dd"),
      endDate: "",
      occurrences: 0,
      dayOfMonth: today.getDate(),
      isPaused: false,
    },
  })

  const [recurringEndType, setRecurringEndType] = useState<"never" | "date" | "occurrences">(
    transfer?.recurringConfig?.endDate
      ? "date"
      : transfer?.recurringConfig?.occurrences && transfer.recurringConfig.occurrences > 0
        ? "occurrences"
        : "never",
  )

  // Funktion zum Berechnen des nächsten Datums basierend auf dem Intervall
  const getNextDate = (date: Date, interval: RecurringInterval): Date => {
    const nextDate = new Date(date)

    switch (interval) {
      case "weekly":
        return addDays(nextDate, 7)
      case "biweekly":
        return addDays(nextDate, 14)
      case "monthly":
        return addMonths(nextDate, 1)
      case "bimonthly":
        return addMonths(nextDate, 2)
      case "quarterly":
        return addMonths(nextDate, 3)
      case "semiannually":
        return addMonths(nextDate, 6)
      case "yearly":
        return addYears(nextDate, 1)
      default:
        return addMonths(nextDate, 1)
    }
  }

  // Funktion zum Formatieren des Intervalls
  const formatInterval = (interval: RecurringInterval) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.fromAccountId === formData.toAccountId) {
      alert("Quell- und Zielkonto dürfen nicht identisch sein.")
      return
    }

    // Bereite die Daten für die Übermittlung vor
    const transferData = {
      ...formData,
      amount: Number.parseFloat(formData.amount),
      recurringConfig: formData.isRecurring
        ? {
            ...formData.recurringConfig,
            // Setze endDate oder occurrences basierend auf recurringEndType
            endDate: recurringEndType === "date" ? formData.recurringConfig.endDate : "",
            occurrences: recurringEndType === "occurrences" ? formData.recurringConfig.occurrences : 0,
          }
        : undefined,
    }

    if (transfer) {
      updateTransfer(transferData as Transfer)
    } else {
      addTransfer(transferData)
    }

    onSuccess()
  }

  // Berechne das nächste Datum für die Vorschau
  const nextDate = formData.isRecurring
    ? getNextDate(new Date(formData.date), formData.recurringInterval as RecurringInterval)
    : null

  // Verfügbare Intervalle aus den Einstellungen
  const availableIntervals = data.settings.recurring?.enabledIntervals || [
    "monthly",
    "bimonthly",
    "quarterly",
    "semiannually",
    "yearly",
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Datum</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Betrag</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Beschreibung</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fromAccount">Von Konto</Label>
          <Select
            value={formData.fromAccountId}
            onValueChange={(value) => setFormData({ ...formData, fromAccountId: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Konto wählen" />
            </SelectTrigger>
            <SelectContent>
              {data.accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: account.color }} />
                    {account.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="toAccount">Zu Konto</Label>
          <Select
            value={formData.toAccountId}
            onValueChange={(value) => setFormData({ ...formData, toAccountId: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Konto wählen" />
            </SelectTrigger>
            <SelectContent>
              {data.accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: account.color }} />
                    {account.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="person">Person</Label>
        <Select
          value={formData.personId}
          onValueChange={(value) => setFormData({ ...formData, personId: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Person wählen" />
          </SelectTrigger>
          <SelectContent>
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
        <Label htmlFor="notes">Notizen</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isRecurring"
          checked={formData.isRecurring}
          onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
        />
        <Label htmlFor="isRecurring">Wiederkehrend</Label>
      </div>

      {formData.isRecurring && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recurringInterval">Intervall</Label>
              <Select
                value={formData.recurringInterval}
                onValueChange={(value) => setFormData({ ...formData, recurringInterval: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Intervall wählen" />
                </SelectTrigger>
                <SelectContent>
                  {availableIntervals.map((interval) => (
                    <SelectItem key={interval} value={interval}>
                      {formatInterval(interval)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurringEndType">Ende</Label>
              <Select
                value={recurringEndType}
                onValueChange={(value) => setRecurringEndType(value as "never" | "date" | "occurrences")}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ende wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Nie</SelectItem>
                  <SelectItem value="date">Datum</SelectItem>
                  <SelectItem value="occurrences">Vorkommen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {recurringEndType === "date" && (
            <div className="space-y-2">
              <Label htmlFor="endDate">Enddatum</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.recurringConfig.endDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recurringConfig: { ...formData.recurringConfig, endDate: e.target.value },
                  })
                }
                required
              />
            </div>
          )}

          {recurringEndType === "occurrences" && (
            <div className="space-y-2">
              <Label htmlFor="occurrences">Anzahl Vorkommen</Label>
              <Input
                id="occurrences"
                type="number"
                min="1"
                value={formData.recurringConfig.occurrences.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recurringConfig: { ...formData.recurringConfig, occurrences: Number.parseInt(e.target.value) },
                  })
                }
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nextDate">Nächstes Datum</Label>
            <Input id="nextDate" type="date" value={nextDate ? format(nextDate, "yyyy-MM-dd") : ""} readOnly />
          </div>
        </div>
      )}

      <Button type="submit">Übertragen</Button>
    </form>
  )
}
