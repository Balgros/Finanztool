// Ein verbesserter E-Mail-Service für die Anwendung
import { v4 as uuidv4 } from "uuid"
import { toast } from "@/components/ui/use-toast"

export interface EmailOptions {
  to: string
  subject: string
  body: string
  replyTo?: string
}

// Speicher für simulierte gesendete E-Mails
let sentEmails: Array<EmailOptions & { id: string; sentAt: Date; status: "success" | "error"; error?: string }> = []

// Lade gespeicherte E-Mails beim Start
if (typeof window !== "undefined") {
  try {
    const storedEmails = localStorage.getItem("sentEmails")
    if (storedEmails) {
      sentEmails = JSON.parse(storedEmails)
    }
  } catch (error) {
    console.error("Fehler beim Laden der gespeicherten E-Mails:", error)
  }
}

// Funktion zum Senden einer E-Mail über die Serverless Function
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Erstelle einen Datensatz für die E-Mail
    const emailRecord = {
      ...options,
      id: uuidv4(),
      sentAt: new Date(),
      status: "pending" as const,
    }

    // Zeige eine Toast-Benachrichtigung an, dass die E-Mail gesendet wird
    toast({
      title: "E-Mail wird gesendet",
      description: `An: ${options.to}`,
    })

    // Sende die E-Mail über die API-Route
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    })

    const data = await response.json()

    // Aktualisiere den E-Mail-Datensatz basierend auf der Antwort
    if (data.success) {
      emailRecord.status = "success"

      // Speichere die E-Mail im lokalen Speicher
      sentEmails.push(emailRecord)
      localStorage.setItem("sentEmails", JSON.stringify(sentEmails))

      // Zeige eine Erfolgsmeldung an
      toast({
        title: "E-Mail erfolgreich gesendet",
        description: `An: ${options.to}\nBetreff: ${options.subject}`,
      })

      return true
    } else {
      emailRecord.status = "error"
      emailRecord.error = data.error || "Unbekannter Fehler"

      // Speichere die fehlgeschlagene E-Mail im lokalen Speicher
      sentEmails.push(emailRecord)
      localStorage.setItem("sentEmails", JSON.stringify(sentEmails))

      // Zeige eine Fehlermeldung an
      toast({
        title: "Fehler beim Senden der E-Mail",
        description: data.error || "Die E-Mail konnte nicht gesendet werden.",
        variant: "destructive",
      })

      return false
    }
  } catch (error) {
    console.error("Fehler beim Senden der E-Mail:", error)

    // Speichere die fehlgeschlagene E-Mail im lokalen Speicher
    const emailRecord = {
      ...options,
      id: uuidv4(),
      sentAt: new Date(),
      status: "error" as const,
      error: (error as Error).message,
    }

    sentEmails.push(emailRecord)
    localStorage.setItem("sentEmails", JSON.stringify(sentEmails))

    // Zeige eine Fehlermeldung an
    toast({
      title: "Fehler beim Senden der E-Mail",
      description: (error as Error).message || "Die E-Mail konnte nicht gesendet werden.",
      variant: "destructive",
    })

    return false
  }
}

// Fallback-Funktion für die Simulation des E-Mail-Versands (wird verwendet, wenn die API nicht verfügbar ist)
export async function simulateEmailSending(options: EmailOptions): Promise<boolean> {
  try {
    // Simuliere das Senden einer E-Mail
    console.log("E-Mail wird simuliert:", options)

    // Simuliere eine Verzögerung für das Senden der E-Mail
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Speichere die E-Mail im lokalen Speicher
    const emailRecord = {
      ...options,
      id: uuidv4(),
      sentAt: new Date(),
      status: "success" as const,
    }

    sentEmails.push(emailRecord)
    localStorage.setItem("sentEmails", JSON.stringify(sentEmails))

    // Zeige eine Benachrichtigung an
    toast({
      title: "E-Mail simuliert",
      description: `An: ${options.to}\nBetreff: ${options.subject}`,
    })

    // Öffne einen Dialog mit der E-Mail (in einer echten Anwendung würde dies nicht passieren)
    showEmailDialog(options)

    return true
  } catch (error) {
    console.error("Fehler beim Simulieren der E-Mail:", error)

    toast({
      title: "Fehler beim Simulieren der E-Mail",
      description: "Die E-Mail konnte nicht simuliert werden.",
      variant: "destructive",
    })

    return false
  }
}

// Funktion zum Anzeigen eines Dialogs mit der E-Mail (nur für die Simulation)
function showEmailDialog(email: EmailOptions) {
  // Erstelle ein modales Fenster
  const modal = document.createElement("div")
  modal.style.position = "fixed"
  modal.style.top = "0"
  modal.style.left = "0"
  modal.style.width = "100%"
  modal.style.height = "100%"
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
  modal.style.display = "flex"
  modal.style.justifyContent = "center"
  modal.style.alignItems = "center"
  modal.style.zIndex = "9999"

  // Erstelle den Inhalt des modalen Fensters
  const content = document.createElement("div")
  content.style.backgroundColor = "white"
  content.style.padding = "20px"
  content.style.borderRadius = "8px"
  content.style.maxWidth = "600px"
  content.style.width = "90%"
  content.style.maxHeight = "80vh"
  content.style.overflow = "auto"

  // Erstelle den Header
  const header = document.createElement("div")
  header.style.marginBottom = "15px"
  header.style.borderBottom = "1px solid #eee"
  header.style.paddingBottom = "10px"
  header.style.display = "flex"
  header.style.justifyContent = "space-between"
  header.style.alignItems = "center"

  const title = document.createElement("h3")
  title.textContent = "Simulierte E-Mail"
  title.style.margin = "0"
  title.style.fontSize = "18px"
  title.style.fontWeight = "bold"

  const closeButton = document.createElement("button")
  closeButton.textContent = "×"
  closeButton.style.background = "none"
  closeButton.style.border = "none"
  closeButton.style.fontSize = "24px"
  closeButton.style.cursor = "pointer"
  closeButton.style.padding = "0 5px"
  closeButton.onclick = () => document.body.removeChild(modal)

  header.appendChild(title)
  header.appendChild(closeButton)

  // Erstelle den E-Mail-Inhalt
  const emailContent = document.createElement("div")

  const toField = document.createElement("p")
  toField.innerHTML = `<strong>An:</strong> ${email.to}`
  toField.style.margin = "5px 0"

  const subjectField = document.createElement("p")
  subjectField.innerHTML = `<strong>Betreff:</strong> ${email.subject}`
  subjectField.style.margin = "5px 0"

  const bodyField = document.createElement("div")
  bodyField.innerHTML = `<strong>Nachricht:</strong><br><div style="white-space: pre-wrap; margin-top: 10px; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">${email.body}</div>`
  bodyField.style.margin = "15px 0"

  const note = document.createElement("p")
  note.textContent =
    "Hinweis: Dies ist eine Simulation. In einer echten Anwendung würde diese E-Mail an den Empfänger gesendet werden."
  note.style.fontSize = "12px"
  note.style.color = "#666"
  note.style.marginTop = "20px"
  note.style.padding = "10px"
  note.style.backgroundColor = "#fffde7"
  note.style.borderRadius = "4px"

  emailContent.appendChild(toField)
  emailContent.appendChild(subjectField)
  emailContent.appendChild(bodyField)
  emailContent.appendChild(note)

  // Füge alles zusammen
  content.appendChild(header)
  content.appendChild(emailContent)
  modal.appendChild(content)

  // Füge das modale Fenster zum Body hinzu
  document.body.appendChild(modal)
}

// Funktion zum Abrufen aller gesendeten E-Mails
export function getSentEmails() {
  try {
    return sentEmails
  } catch (error) {
    console.error("Fehler beim Abrufen der gesendeten E-Mails:", error)
    return []
  }
}

// Generiere einen sicheren Einladungstoken
export function generateInvitationToken(): string {
  return uuidv4()
}

// Speichere den Token im localStorage (in einer echten Anwendung würde dies in einer Datenbank gespeichert)
export function storeInvitationToken(email: string, token: string): void {
  const tokens = getStoredInvitationTokens()
  tokens[email] = {
    token,
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem("invitationTokens", JSON.stringify(tokens))
}

// Hole alle gespeicherten Tokens
export function getStoredInvitationTokens(): Record<string, { token: string; createdAt: string }> {
  const tokensJson = localStorage.getItem("invitationTokens")
  return tokensJson ? JSON.parse(tokensJson) : {}
}

// Validiere einen Token
export function validateInvitationToken(email: string, token: string): boolean {
  const tokens = getStoredInvitationTokens()
  const storedToken = tokens[email]

  if (!storedToken) return false

  // Prüfe, ob der Token übereinstimmt
  if (storedToken.token !== token) return false

  // Prüfe, ob der Token nicht älter als 7 Tage ist
  const createdAt = new Date(storedToken.createdAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - createdAt.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays > 7) return false

  return true
}

// Entferne einen Token nach erfolgreicher Verwendung
export function removeInvitationToken(email: string): void {
  const tokens = getStoredInvitationTokens()
  delete tokens[email]
  localStorage.setItem("invitationTokens", JSON.stringify(tokens))
}

// Vorlagen für verschiedene E-Mail-Typen
export const emailTemplates = {
  familyMemberInvitation: (
    inviterName: string,
    inviteeEmail: string,
    inviteeRelation: string,
    appUrl: string,
    token: string,
  ) => ({
    subject: `${inviterName} hat dich zu Finance Manager Pro eingeladen`,
    body: `
Hallo,

${inviterName} hat dich als ${getRelationName(inviteeRelation)} zu Finance Manager Pro eingeladen.

Mit dieser Einladung kannst du auf die Finanzdaten von ${inviterName} zugreifen und diese verwalten.

Um die Einladung anzunehmen, klicke bitte auf den folgenden Link:
${appUrl}/invitation/accept?email=${encodeURIComponent(inviteeEmail)}&token=${token}

Wenn du die Einladung ablehnen möchtest, klicke bitte hier:
${appUrl}/invitation/decline?email=${encodeURIComponent(inviteeEmail)}&token=${token}

Dieser Link ist 7 Tage gültig.

Viele Grüße,
Das Finance Manager Pro Team
    `,
  }),

  // Neue E-Mail-Vorlage für wiederkehrende Transaktionen
  recurringTransactionReminder: (
    userName: string,
    transactionType: "income" | "expense",
    description: string,
    amount: string,
    dueDate: string,
    daysUntilDue: number,
  ) => ({
    subject: `Erinnerung: Wiederkehrende ${
      transactionType === "income" ? "Einnahme" : "Ausgabe"
    } steht in ${daysUntilDue} Tagen an`,
    body: `
Hallo ${userName},

dies ist eine Erinnerung an eine bevorstehende wiederkehrende ${transactionType === "income" ? "Einnahme" : "Ausgabe"}:

Beschreibung: ${description}
Betrag: ${amount}
Fälligkeitsdatum: ${dueDate}
Tage bis zur Fälligkeit: ${daysUntilDue}

Du erhältst diese Benachrichtigung, weil du in deinen Einstellungen festgelegt hast, 
dass du ${daysUntilDue} Tage vor fälligen wiederkehrenden Transaktionen benachrichtigt werden möchtest.

Viele Grüße,
Dein Finance Manager Pro
    `,
  }),

  // Tägliche Zusammenfassung der anstehenden Transaktionen
  dailyTransactionSummary: (
    userName: string,
    upcomingIncomes: Array<{ description: string; amount: string; dueDate: string }>,
    upcomingExpenses: Array<{ description: string; amount: string; dueDate: string }>,
  ) => ({
    subject: `Tägliche Zusammenfassung deiner anstehenden Transaktionen`,
    body: `
Hallo ${userName},

hier ist deine tägliche Zusammenfassung der anstehenden Transaktionen:

${
  upcomingIncomes.length > 0
    ? `ANSTEHENDE EINNAHMEN:
${upcomingIncomes.map((income) => `- ${income.description}: ${income.amount} (fällig am ${income.dueDate})`).join("\n")}
`
    : "Du hast keine anstehenden Einnahmen in den nächsten Tagen."
}

${
  upcomingExpenses.length > 0
    ? `ANSTEHENDE AUSGABEN:
${upcomingExpenses
  .map((expense) => `- ${expense.description}: ${expense.amount} (fällig am ${expense.dueDate})`)
  .join("\n")}
`
    : "Du hast keine anstehenden Ausgaben in den nächsten Tagen."
}

Du erhältst diese tägliche Zusammenfassung, weil du diese Funktion in deinen Einstellungen aktiviert hast.

Viele Grüße,
Dein Finance Manager Pro
    `,
  }),
}

// Hilfsfunktion zum Übersetzen der Beziehungstypen
function getRelationName(relation: string): string {
  switch (relation) {
    case "spouse":
      return "Partner/in"
    case "child":
      return "Kind"
    case "parent":
      return "Elternteil"
    case "sibling":
      return "Geschwister"
    case "other":
      return "Familienmitglied"
    default:
      return relation
  }
}
