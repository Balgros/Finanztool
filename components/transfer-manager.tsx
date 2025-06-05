"use client"

import { useState, useEffect } from "react"
import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"
import { TransferForm } from "@/components/forms/transfer-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash, ArrowRightLeft, RefreshCcw, Calendar, PauseCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format, isAfter } from "date-fns"
import { de } from "date-fns/locale"
import type { Transfer } from "@/types/finance"

export function TransferManager() {
  const {
    timeRange,
    setTimeRange,
    getFilteredTransfers,
    deleteTransfer,
    getAccountById,
    getPersonById,
    formatCurrency,
    data,
  } = useFinance()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentTransfer, setCurrentTransfer] = useState<Transfer | null>(null)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [activeTab, setActiveTab] = useState("all")

  // Stelle sicher, dass data.transfers existiert
  useEffect(() => {
    if (data && !data.transfers) {
      data.transfers = []
    }
  }, [data])

  // Aktualisiere die Transfers, wenn sich die Zeitspanne ändert
  useEffect(() => {
    try {
      if (data && data.transfers) {
        const filteredTransfers = getFilteredTransfers()
        setTransfers(filteredTransfers)
      } else {
        setTransfers([])
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der Überträge:", error)
      setTransfers([])
    }
  }, [timeRange, data, getFilteredTransfers])

  const handleEditTransfer = (transfer: Transfer) => {
    setCurrentTransfer(transfer)
    setIsEditDialogOpen(true)
  }

  const handleDeleteTransfer = (id: string) => {
    if (window.confirm("Möchtest du diesen Kontoübertrag wirklich löschen?")) {
      deleteTransfer(id)
    }
  }

  // Lokale Formatierungsfunktion als Fallback
  const formatCurrencyLocal = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: data.settings.currency || "CHF",
    }).format(amount)
  }

  // Verwende die formatCurrency-Funktion aus dem Context oder die lokale Fallback-Funktion
  const formatAmount = (amount: number) => {
    try {
      return formatCurrency ? formatCurrency(amount) : formatCurrencyLocal(amount)
    } catch (error) {
      return formatCurrencyLocal(amount)
    }
  }

  // Filtere Transfers basierend auf dem aktiven Tab
  const getFilteredTransfersByTab = () => {
    switch (activeTab) {
      case "recurring":
        return transfers.filter((transfer) => transfer.isRecurring)
      case "history":
        return transfers.filter((transfer) => !transfer.isRecurring && transfer.parentTransferId)
      case "one-time":
        return transfers.filter((transfer) => !transfer.isRecurring && !transfer.parentTransferId)
      default:
        return transfers
    }
  }

  const filteredTransfers = getFilteredTransfersByTab()

  // Formatiere das Intervall für die Anzeige
  const formatInterval = (interval?: string): string => {
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
        return "Unbekannt"
    }
  }

  // Berechne den Status eines wiederkehrenden Transfers
  const getRecurringStatus = (transfer: Transfer) => {
    if (!transfer.isRecurring) return null

    if (transfer.recurringConfig?.isPaused) {
      return { status: "paused", label: "Pausiert", icon: PauseCircle, color: "text-yellow-500" }
    }

    if (transfer.recurringConfig?.endDate && isAfter(new Date(), new Date(transfer.recurringConfig.endDate))) {
      return { status: "ended", label: "Beendet", icon: Clock, color: "text-gray-500" }
    }

    return { status: "active", label: "Aktiv", icon: RefreshCcw, color: "text-green-500" }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Kontoüberträge</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <DateRangePicker timeRange={timeRange} onChange={setTimeRange} />
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Neuer Übertrag
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="recurring">Wiederkehrend</TabsTrigger>
          <TabsTrigger value="one-time">Einmalig</TabsTrigger>
          <TabsTrigger value="history">Verlauf</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredTransfers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-muted-foreground mb-4">Keine Kontoüberträge im ausgewählten Zeitraum.</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Kontoübertrag erstellen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTransfers.map((transfer) => {
                const fromAccount = getAccountById(transfer.fromAccountId)
                const toAccount = getAccountById(transfer.toAccountId)
                const person = getPersonById(transfer.personId)
                const recurringStatus = getRecurringStatus(transfer)
                const StatusIcon = recurringStatus?.icon

                return (
                  <Card key={transfer.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{transfer.description}</CardTitle>
                          {transfer.isRecurring && (
                            <CardDescription className="flex items-center mt-1">
                              <RefreshCcw className="h-3.5 w-3.5 mr-1" />
                              {formatInterval(transfer.recurringInterval)}
                              {recurringStatus && (
                                <Badge variant="outline" className={`ml-2 ${recurringStatus.color} border-current`}>
                                  {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                                  {recurringStatus.label}
                                </Badge>
                              )}
                            </CardDescription>
                          )}
                          {transfer.parentTransferId && (
                            <CardDescription className="flex items-center mt-1">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              Generiert aus wiederkehrendem Übertrag
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditTransfer(transfer)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTransfer(transfer.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-primary/10">
                              <ArrowRightLeft className="h-4 w-4" />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(transfer.date), "dd.MM.yyyy", { locale: de })}
                            </span>
                          </div>
                          <span className="font-medium">{formatAmount(transfer.amount)}</span>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">Von</span>
                            <div className="flex items-center gap-2">
                              {fromAccount && (
                                <>
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: fromAccount.color }}
                                  />
                                  <span>{fromAccount.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-medium">Nach</span>
                            <div className="flex items-center gap-2">
                              {toAccount && (
                                <>
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: toAccount.color }} />
                                  <span>{toAccount.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {person && (
                          <div className="mt-2 text-sm text-muted-foreground">Durchgeführt von: {person.name}</div>
                        )}

                        {transfer.notes && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Notizen:</span> {transfer.notes}
                          </div>
                        )}

                        {transfer.isRecurring && transfer.recurringConfig && (
                          <div className="mt-2 text-sm space-y-1">
                            <div>
                              <span className="font-medium">Startdatum:</span>{" "}
                              {format(new Date(transfer.recurringConfig.startDate || transfer.date), "dd.MM.yyyy", {
                                locale: de,
                              })}
                            </div>
                            {transfer.recurringConfig.endDate && (
                              <div>
                                <span className="font-medium">Enddatum:</span>{" "}
                                {format(new Date(transfer.recurringConfig.endDate), "dd.MM.yyyy", { locale: de })}
                              </div>
                            )}
                            {transfer.recurringConfig.occurrences && transfer.recurringConfig.occurrences > 0 && (
                              <div>
                                <span className="font-medium">Wiederholungen:</span>{" "}
                                {transfer.recurringConfig.occurrences}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Transfer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Neuer Kontoübertrag</DialogTitle>
            <DialogDescription>Erstellen Sie einen neuen Kontoübertrag zwischen Ihren Konten.</DialogDescription>
          </DialogHeader>
          <TransferForm onSuccess={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Transfer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Kontoübertrag bearbeiten</DialogTitle>
            <DialogDescription>Bearbeiten Sie die Details des Kontoübertrags.</DialogDescription>
          </DialogHeader>
          {currentTransfer && <TransferForm transfer={currentTransfer} onSuccess={() => setIsEditDialogOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
