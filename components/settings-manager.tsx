"use client"

import { Input } from "@/components/ui/input"

import type React from "react"

import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { toast } from "@/components/ui/use-toast"
import type { Currency } from "@/types/finance"

export function SettingsManager() {
  const { data, updateSettings, exportData, importData, resetData } = useFinance()
  const { theme, setTheme } = useTheme()

  const handleCurrencyChange = (value: string) => {
    updateSettings({ currency: value as Currency })
    toast({ title: "Währung aktualisiert", description: `Die Währung wurde auf ${value} geändert.` })
  }

  const handleThemeChange = (value: string) => {
    setTheme(value)
    updateSettings({ theme: value })
    toast({ title: "Theme aktualisiert", description: `Das Theme wurde auf ${value} geändert.` })
  }

  const handleExportData = () => {
    const jsonData = exportData()
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tavafinance_backup_${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: "Daten exportiert", description: "Ihre Finanzdaten wurden erfolgreich heruntergeladen." })
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const jsonData = e.target?.result as string
          importData(jsonData)
          toast({ title: "Daten importiert", description: "Ihre Finanzdaten wurden erfolgreich importiert." })
        } catch (error) {
          console.error("Importfehler:", error)
          toast({
            variant: "destructive",
            title: "Importfehler",
            description: "Die Datei konnte nicht verarbeitet werden.",
          })
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>

      <Card>
        <CardHeader>
          <CardTitle>Allgemeine Einstellungen</CardTitle>
          <CardDescription>Passen Sie die Grundeinstellungen Ihrer Finanz-App an.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currency">Standardwährung</Label>
            <Select value={data.settings.currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger id="currency" className="w-full sm:w-[200px]">
                <SelectValue placeholder="Währung auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHF">CHF (Schweizer Franken)</SelectItem>
                <SelectItem value="EUR">EUR (Euro)</SelectItem>
                <SelectItem value="USD">USD (US-Dollar)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">App-Theme</Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger id="theme" className="w-full sm:w-[200px]">
                <SelectValue placeholder="Theme auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Hell</SelectItem>
                <SelectItem value="dark">Dunkel</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datenverwaltung</CardTitle>
          <CardDescription>Exportieren, importieren oder setzen Sie Ihre Finanzdaten zurück.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleExportData} variant="outline" className="w-full sm:w-auto">
            Daten exportieren
          </Button>
          <div>
            <Label htmlFor="import-file" className="block mb-2">
              Daten importieren (JSON)
            </Label>
            <Input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground mt-1">Laden Sie eine zuvor exportierte JSON-Datei hoch.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={resetData} variant="destructive" className="w-full sm:w-auto">
            Alle Daten zurücksetzen
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
