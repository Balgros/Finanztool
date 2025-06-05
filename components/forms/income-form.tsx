"use client"

import React from "react"
import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import type { Income, RecurringInterval } from "@/types/finance"
import { format, addDays, addMonths, addYears } from "date-fns"
import { de } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface IncomeFormProps {
  income?: Income
  onSuccess: () => void
}

export function IncomeForm({ income, onSuccess }: IncomeFormProps) {
  const { data, addIncome, updateIncome } = useFinance()
  const today = new Date()

  const [formData, setFormData] = useState({
    id: income?.id || "",
    date: income?.date || format(today, "yyyy-MM-dd"),
    amount: income?.amount.toString() || "",
    description: income?.description || "",
    categoryId: income?.categoryId || "",
    accountId: income?.accountId || data.accounts.find((a) => a.isDefault)?.id || data.accounts[0]?.id || "",
    personId: income?.personId || "",
    notes: income?.notes || "",
    isRecurring: income?.isRecurring || false,
    recurringInterval: income?.recurringInterval || "monthly",
    incomeType: income?.incomeType || "regular",
    recurringConfig: income?.recurringConfig || {
      startDate: income?.date || format(today, "yyyy-MM-dd"),
      endDate: "",
      occurrences: 0,
      dayOfMonth: today.getDate(),
      isPaused: false,
    },
  })

  const [recurringEndType, setRecurringEndType] = useState<"never" | "date" | "occurrences">(
    income?.recurringConfig?.endDate
      ? "date"
      : income?.recurringConfig?.occurrences && income.recurringConfig.occurrences > 0
        ? "occurrences"
        : "never",
  )

  // Funktion zum Finden des Standard-Kontos für eine Person
  const getDefaultAccountForPerson = (personId: string) => {
    if (!personId) return ""

    // Suche nach einem Konto, das als Standard für diese Person festgelegt ist
    const defaultAccount = data.accounts.find(
      (account) => account.defaultForPersonIds && account.defaultForPersonIds.includes(personId),
    )

    return defaultAccount ? defaultAccount.id : ""
  }

  // Aktualisiere das Konto, wenn sich die Person ändert
  React.useEffect(() => {
    if (formData.personId && !income) {
      const defaultAccountId = getDefaultAccountForPerson(formData.personId)
      if (defaultAccountId) {
        setFormData((prev) => ({
          ...prev,
          accountId: defaultAccountId,
        }))
      }
    }
  }, [formData.personId, income])

  const incomeCategories = data.categories.filter((category) => category.type === "income")

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

    // Bereite die Daten für die Übermittlung vor
    const incomeData = {
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

    if (income) {
      updateIncome(incomeData as Income)
    } else {
      addIncome(incomeData)
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
          <Label htmlFor="category">Kategorie</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Kategorie wählen" />
            </SelectTrigger>
            <SelectContent>
              {incomeCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="account">Konto</Label>
          <Select
            value={formData.accountId}
            onValueChange={(value) => setFormData({ ...formData, accountId: value })}
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

      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="incomeType">Einkommensart</Label>
          <Select
            value={formData.incomeType}
            onValueChange={(value) => setFormData({ ...formData, incomeType: value as Income["incomeType"] })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Art wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Reguläres Einkommen</SelectItem>
              <SelectItem value="bonus">Bonus</SelectItem>
              <SelectItem value="13thSalary">13. Monatsgehalt</SelectItem>
              <SelectItem value="sideIncome">Nebeneinkommen</SelectItem>
              <SelectItem value="other">Sonstiges</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
        <Label htmlFor="isRecurring">Wiederkehrende Einnahme</Label>
      </div>

      {formData.isRecurring && (
        <div className="space-y-4 p-4 border rounded-md bg-muted/20">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Wiederholungsoptionen</h3>
            {nextDate && (
              <div className="text-sm text-muted-foreground">
                Nächste Ausführung: {format(nextDate, "dd.MM.yyyy", { locale: de })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recurringInterval">Intervall</Label>
              <Select
                value={formData.recurringInterval}
                onValueChange={(value) => setFormData({ ...formData, recurringInterval: value as RecurringInterval })}
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

            {(formData.recurringInterval === "monthly" ||
              formData.recurringInterval === "bimonthly" ||
              formData.recurringInterval === "quarterly" ||
              formData.recurringInterval === "semiannually" ||
              formData.recurringInterval === "yearly") && (
              <div className="space-y-2">
                <Label htmlFor="dayOfMonth">Tag des Monats</Label>
                <div className="flex space-x-2 items-center">
                  <Input
                    id="dayOfMonth"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.recurringConfig.dayOfMonth || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurringConfig: {
                          ...formData.recurringConfig,
                          dayOfMonth: Number.parseInt(e.target.value) || 1,
                        },
                      })
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        recurringConfig: {
                          ...formData.recurringConfig,
                          dayOfMonth: new Date(formData.date).getDate(),
                        },
                      })
                    }
                  >
                    Vom Datum
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Endet</Label>
              <Tabs value={recurringEndType} onValueChange={(v) => setRecurringEndType(v as any)}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="never">Nie</TabsTrigger>
                  <TabsTrigger value="date">Am Datum</TabsTrigger>
                  <TabsTrigger value="occurrences">Nach Anzahl</TabsTrigger>
                </TabsList>
                <TabsContent value="never">
                  <p className="text-sm text-muted-foreground">Die wiederkehrende Einnahme läuft unbegrenzt weiter.</p>
                </TabsContent>
                <TabsContent value="date" className="space-y-2">
                  <div className="flex space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.recurringConfig.endDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.recurringConfig.endDate ? (
                            format(new Date(formData.recurringConfig.endDate), "PPP", { locale: de })
                          ) : (
                            <span>Enddatum wählen</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            formData.recurringConfig.endDate ? new Date(formData.recurringConfig.endDate) : undefined
                          }
                          onSelect={(date) =>
                            setFormData({
                              ...formData,
                              recurringConfig: {
                                ...formData.recurringConfig,
                                endDate: date ? format(date, "yyyy-MM-dd") : "",
                              },
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </TabsContent>
                <TabsContent value="occurrences" className="space-y-2">
                  <div className="flex space-x-2 items-center">
                    <Input
                      type="number"
                      min="1"
                      value={formData.recurringConfig.occurrences || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recurringConfig: {
                            ...formData.recurringConfig,
                            occurrences: Number.parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      placeholder="Anzahl"
                    />
                    <span className="text-sm text-muted-foreground">Wiederholungen</span>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPaused"
                checked={formData.recurringConfig.isPaused}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    recurringConfig: {
                      ...formData.recurringConfig,
                      isPaused: checked,
                    },
                  })
                }
              />
              <Label htmlFor="isPaused">Pausiert</Label>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Abbrechen
        </Button>
        <Button type="submit">{income ? "Aktualisieren" : "Hinzufügen"}</Button>
      </div>
    </form>
  )
}
