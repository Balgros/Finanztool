"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react"
import { validateInvitationToken, removeInvitationToken } from "@/services/email-service"

export default function InvitationPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const action = params.action as string
  const email = searchParams.get("email")
  const token = searchParams.get("token")

  const [isProcessing, setIsProcessing] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Validiere den Token
    const validateToken = async () => {
      if (!email || !token) {
        setIsValid(false)
        setIsProcessing(false)
        return
      }

      const isTokenValid = validateInvitationToken(email, token)
      setIsValid(isTokenValid)

      // Simuliere eine Verarbeitungszeit
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (isTokenValid && action === "accept") {
        // Entferne den Token nach erfolgreicher Verwendung
        removeInvitationToken(email)

        // In einer echten Anwendung würde hier der Status des Familienmitglieds aktualisiert werden
        // und ein Konto erstellt oder verknüpft werden
      }

      setIsProcessing(false)
      setIsComplete(true)
    }

    validateToken()
  }, [action, email, token])

  const handleContinue = () => {
    router.push("/login")
  }

  const getActionContent = () => {
    if (isProcessing) {
      return {
        title: "Einladung wird verarbeitet",
        description: "Bitte warten Sie, während wir Ihre Anfrage verarbeiten...",
        icon: <Loader2 className="h-12 w-12 animate-spin text-primary" />,
        buttonText: "Wird verarbeitet...",
      }
    }

    if (!isValid) {
      return {
        title: "Ungültige oder abgelaufene Einladung",
        description: "Der Einladungslink ist ungültig oder abgelaufen. Bitte fordern Sie eine neue Einladung an.",
        icon: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
        buttonText: "Zur Startseite",
      }
    }

    if (action === "accept") {
      return {
        title: "Einladung angenommen",
        description:
          "Sie haben die Einladung erfolgreich angenommen. Sie können sich jetzt anmelden, um auf die Finanzdaten zuzugreifen.",
        icon: <CheckCircle className="h-12 w-12 text-green-500" />,
        buttonText: "Zur Anmeldung",
      }
    } else {
      return {
        title: "Einladung abgelehnt",
        description:
          "Sie haben die Einladung abgelehnt. Falls Sie Ihre Meinung ändern, kontaktieren Sie bitte die Person, die Sie eingeladen hat.",
        icon: <XCircle className="h-12 w-12 text-red-500" />,
        buttonText: "Schließen",
      }
    }
  }

  const content = getActionContent()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-bold">Finance Manager Pro</h1>
          <p className="text-sm text-muted-foreground">Familienmitglied-Einladung</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">{content.icon}</div>
            <CardTitle className="text-xl">{content.title}</CardTitle>
            <CardDescription>{content.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {isComplete && action === "accept" && isValid && (
              <p className="text-sm text-muted-foreground">
                Sie können sich jetzt mit Ihrer E-Mail-Adresse registrieren, um auf die geteilten Finanzdaten
                zuzugreifen.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleContinue} disabled={isProcessing}>
              {content.buttonText}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
