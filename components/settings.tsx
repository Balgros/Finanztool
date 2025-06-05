"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Currency, RecurringInterval } from "@/types/finance"
import { Download, Upload, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

export function Settings() {
  const { data, setCurrency, setPaydayOfMonth, exportData, importData, resetData, updateRecurringSettings } =
    useFinance()
  const [paydayValue, setPaydayValue] = useState(data.settings.paydayOfMonth.toString())
  const { toast } = useToast()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      toast({
        title: "Fehler",
        description: "Keine Datei ausgewählt",
        variant: "destructive",
      })
      return
    }

    // Überprüfe den Dateityp
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      toast({
        title: "Ungültiges Dateiformat",
        description: "Bitte wähle eine JSON-Datei aus",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        if (event.target?.result) {
          const jsonString = event.target.result as string
          importData(jsonString)
        }
      } catch (error) {
        console.error("Fehler beim Lesen der Datei:", error)
        toast({
          title: "Fehler beim Lesen der Datei",
          description: "Die Datei konnte nicht gelesen werden",
          variant: "destructive",
        })
      }
    }

    reader.onerror = () => {
      toast({
        title: "Fehler beim Lesen der Datei",
        description: "Die Datei konnte nicht gelesen werden",
        variant: "destructive",
      })
    }

    reader.readAsText(file)

    // Reset the input
    e.target.value = ""
  }

  const handleReset = () => {
    if (
      window.confirm("Möchtest du wirklich alle Daten zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.")
    ) {
      resetData()
    }
  }

  const handlePaydayChange = () => {
    const payday = Number.parseInt(paydayValue, 10)
    if (isNaN(payday) || payday < 1 || payday > 31) {
      toast({
        title: "Ungültiger Lohntag",
        description: "Der Lohntag muss zwischen 1 und 31 liegen.",
        variant: "destructive",
      })
      return
    }
    setPaydayOfMonth(payday)
  }

  // Alle verfügbaren Intervalle
  const allIntervals: { value: RecurringInterval; label: string }[] = [
    { value: "weekly", label: "Wöchentlich" },
    { value: "biweekly", label: "Alle 2 Wochen" },
    { value: "monthly", label: "Monatlich" },
    { value: "bimonthly", label: "Alle 2 Monate" },
    { value: "quarterly", label: "Vierteljährlich" },
    { value: "semiannually", label: "Halbjährlich" },
    { value: "yearly", label: "Jährlich" },
  ]

  // Aktuell aktivierte Intervalle
  const [enabledIntervals, setEnabledIntervals] = useState<RecurringInterval[]>(
    data.settings.recurring?.enabledIntervals || ["monthly", "bimonthly", "quarterly", "semiannually", "yearly"],
  )

  // Funktion zum Umschalten eines Intervalls
  const toggleInterval = (interval: RecurringInterval) => {
    const newEnabledIntervals = enabledIntervals.includes(interval)
      ? enabledIntervals.filter((i) => i !== interval)
      : [...enabledIntervals, interval]

    setEnabledIntervals(newEnabledIntervals)
    updateRecurringSettings({ enabledIntervals: newEnabledIntervals })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Darstellung</CardTitle>
            <CardDescription>Passe die Darstellung der Anwendung an deine Bedürfnisse an.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Währung</Label>
              <Select value={data.settings.currency} onValueChange={(value) => setCurrency(value as Currency)}>
                <SelectTrigger>
                  <SelectValue placeholder="Währung wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHF">Schweizer Franken (CHF)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="USD">US-Dollar ($)</SelectItem>
                  <SelectItem value="GBP">Britisches Pfund (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lohnperiode</CardTitle>
            <CardDescription>Lege fest, an welchem Tag des Monats dein Lohn eingeht.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payday">Lohntag (Tag des Monats)</Label>
              <div className="flex gap-2">
                <Input
                  id="payday"
                  type="number"
                  min="1"
                  max="31"
                  value={paydayValue}
                  onChange={(e) => setPaydayValue(e.target.value)}
                  className="w-24"
                />
                <Button onClick={handlePaydayChange}>Speichern</Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Die Finanzperiode läuft vom {data.settings.paydayOfMonth}. eines Monats bis zum{" "}
                {data.settings.paydayOfMonth - 1 === 0 ? "letzten Tag" : `${data.settings.paydayOfMonth - 1}.`} des
                Folgemonats.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wiederkehrende Zahlungen</CardTitle>
            <CardDescription>
              Lege fest, welche Intervalle für wiederkehrende Zahlungen verfügbar sein sollen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allIntervals.map((interval) => (
                <div key={interval.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`interval-${interval.value}`}
                    checked={enabledIntervals.includes(interval.value)}
                    onCheckedChange={() => toggleInterval(interval.value)}
                  />
                  <Label htmlFor={`interval-${interval.value}`}>{interval.label}</Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Hinweis: Das Deaktivieren eines Intervalls verhindert nicht, dass bestehende wiederkehrende Zahlungen mit
              diesem Intervall weiterhin funktionieren.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datenmanagement</CardTitle>
            <CardDescription>Exportiere, importiere oder setze deine Finanzdaten zurück.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={exportData} className="flex-1">
                <Download className="mr-2 h-4 w-4" /> Daten exportieren
              </Button>
              <Button onClick={handleImport} className="flex-1">
                <Upload className="mr-2 h-4 w-4" /> Daten importieren
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            </div>

            <div className="pt-4 border-t">
              <Button variant="destructive" onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" /> Alle Daten zurücksetzen
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Achtung: Diese Aktion löscht alle deine Finanzdaten und kann nicht rückgängig gemacht werden.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
