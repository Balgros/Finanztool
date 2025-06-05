import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
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
    // Anfrage parsen
    const body = await request.json()

    // Daten validieren
    const result = emailSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Ungültige Anfragedaten", details: result.error.format() }, { status: 400 })
    }

    const { to, subject, body: emailBody, replyTo } = result.data

    // Überprüfen, ob die erforderlichen Umgebungsvariablen vorhanden sind
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error("E-Mail-Konfiguration fehlt")
      return NextResponse.json({ error: "E-Mail-Server nicht konfiguriert" }, { status: 500 })
    }

    // E-Mail-Transporter konfigurieren
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // E-Mail-Optionen
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: emailBody,
      html: emailBody.replace(/\n/g, "<br>"),
      ...(replyTo && { replyTo }),
    }

    // E-Mail senden
    const info = await transporter.sendMail(mailOptions)

    console.log("E-Mail gesendet:", info.messageId)

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    })
  } catch (error) {
    console.error("E-Mail-Fehler:", error)
    return NextResponse.json(
      { error: "E-Mail konnte nicht gesendet werden", details: (error as Error).message },
      { status: 500 },
    )
  }
}
