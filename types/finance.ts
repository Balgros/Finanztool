export type Currency = "EUR" | "USD" | "GBP" | "CHF"

export type RecurringInterval =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "bimonthly"
  | "quarterly"
  | "semiannually"
  | "yearly"

export interface Transaction {
  id: string
  date: string
  amount: number
  description: string
  categoryId: string
  accountId: string
  personId: string
  notes?: string
  isRecurring?: boolean
  recurringInterval?: RecurringInterval
  recurringConfig?: {
    startDate?: string // Wenn unterschiedlich vom Transaktionsdatum
    endDate?: string // Optional: Enddatum
    occurrences?: number // Optional: Anzahl der Wiederholungen
    dayOfMonth?: number // Optional: Tag des Monats (1-31)
    weekday?: number // Optional: Wochentag (0-6, 0 = Sonntag)
    weekOfMonth?: number // Optional: Woche des Monats (1-5, 1 = erste Woche)
    monthsOfYear?: number[] // Optional: Monate des Jahres (1-12)
    isPaused?: boolean // Optional: Pausiert die wiederkehrende Transaktion
  }
}

export interface Expense extends Transaction {}

export interface Income extends Transaction {
  incomeType?: "regular" | "bonus" | "13thSalary" | "sideIncome" | "other"
}

export interface Transfer {
  id: string
  date: string
  amount: number
  description: string
  fromAccountId: string
  toAccountId: string
  personId: string
}

// Ich habe zwei wichtige Funktionen für Ihr Finanztool implementiert:

// ### 1. Forecast für den nächsten Monat

// Diese Funktion erstellt eine Prognose für den kommenden Monat basierend auf:
// - Wiederkehrenden Einnahmen und Ausgaben
// - Historischen Transaktionsdaten
// - Geplanten Überweisungen

// Die Forecast-Seite zeigt:
// - Erwartete Einnahmen und Ausgaben
// - Prognostizierte Kontostände am Monatsende
// - Visuelle Darstellung der Cashflow-Entwicklung
// - Vergleich mit dem aktuellen Monat

// ### 2. E-Mail-Einladungssystem

// Das Einladungssystem ermöglicht:
// - Einladung von Familienmitgliedern per E-Mail
// - Sichere Token-basierte Einladungslinks
// - Annahme oder Ablehnung von Einladungen
// - Erneutes Senden von Einladungen
// - Nachverfolgung des Einladungsstatus

// Die Implementierung umfasst:
// - Einen verbesserten E-Mail-Service
// - Token-Generierung und -Validierung
// - Eine dedizierte Einladungsseite
// - Aktualisierte Formulare für Familienmitglieder
