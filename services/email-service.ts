// Vereinfachter E-Mail-Service ohne echte E-Mail-Funktionalität

// Speicher für simulierte gesendete E-Mails
const sentEmails: Array<any> = []

// Funktion zum Simulieren des E-Mail-Versands
export async function sendEmail(options: {
  to: string
  subject: string
  body: string
  replyTo?: string
}): Promise<boolean> {
  try {
    console.log("E-Mail wird simuliert:", options)

    // Simuliere eine Verzögerung
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Speichere die E-Mail im lokalen Speicher
    const emailRecord = {
      ...options,
      id: crypto.randomUUID(),
      sentAt: new Date(),
      status: "success" as const,
    }

    sentEmails.push(emailRecord)
    localStorage.setItem("sentEmails", JSON.stringify(sentEmails))

    console.log("E-Mail erfolgreich simuliert:", emailRecord)
    return true
  } catch (error) {
    console.error("Fehler beim Simulieren der E-Mail:", error)
    return false
  }
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
  return crypto.randomUUID()
}

// Speichere den Token im localStorage
export function storeInvitationToken(email: string, token: string): void {
  const tokens = getStoredInvitationTokens()
  tokens[email] = {
    token,
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem("invitationTokens", JSON.stringify(tokens))
}

// Hole alle gespeicherten Tokens
function getStoredInvitationTokens(): Record<string, { token: string; createdAt: string }> {
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
