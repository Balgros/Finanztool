"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"
import { Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simuliere eine API-Anfrage
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // In einer echten App würde hier eine E-Mail gesendet werden
    setIsSubmitted(true)
    toast({
      title: "Link gesendet",
      description: "Ein Link zum Zurücksetzen des Passworts wurde an deine E-Mail-Adresse gesendet.",
    })

    setIsSubmitting(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-bold">Finance Manager Pro</h1>
          <p className="text-sm text-muted-foreground">Passwort zurücksetzen</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Passwort vergessen</CardTitle>
            <CardDescription>Gib deine E-Mail-Adresse ein, um dein Passwort zurückzusetzen</CardDescription>
          </CardHeader>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Senden...
                    </>
                  ) : (
                    "Link zum Zurücksetzen senden"
                  )}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/login" className="text-primary hover:underline">
                    Zurück zur Anmeldung
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center space-y-2 py-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="text-center">
                  Wir haben dir einen Link zum Zurücksetzen deines Passworts an <strong>{email}</strong> gesendet. Bitte
                  überprüfe deine E-Mails.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail("")
                }}
              >
                Erneut senden
              </Button>
              <div className="text-center text-sm">
                <Link href="/login" className="text-primary hover:underline">
                  Zurück zur Anmeldung
                </Link>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
