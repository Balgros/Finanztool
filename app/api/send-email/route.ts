import { NextResponse } from "next/server"
import { z } from "zod"

// Schema für die Validierung der Anfrage
const emailSchema = z.object({
  to: z.string().email("Ungültige E-Mail-Adresse"),
  subject: z.string().min(1, "Betreff ist erforderlich"),
  body: z.string().min(1, "Nachrichtentext ist erforderlich"),
  replyTo: z.string().email("Ungültige Antwort-E-Mail").optional(),
})

export async function POST(request: Request) {
  try {
    // Simuliere eine Verzögerung
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Gib eine Erfolgsmeldung zurück, ohne tatsächlich E-Mails zu senden
    return NextResponse.json({
      success: true,
      message: "E-Mail-Funktionalität ist deaktiviert. Dies ist eine Simulation.",
    })
  } catch (error) {
    console.error("Fehler:", error)
    return NextResponse.json(
      { error: "E-Mail-Funktionalität ist deaktiviert. Dies ist eine Simulation." },
      { status: 200 },
    )
  }
}
