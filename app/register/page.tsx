"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registrationError, setRegistrationError] = useState<string | null>(null)
  const { register } = useAuth()
  const router = useRouter()

  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError("Die Passwörter stimmen nicht überein")
      return false
    }
    if (password.length < 6) {
      setPasswordError("Das Passwort muss mindestens 6 Zeichen lang sein")
      return false
    }
    setPasswordError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegistrationError(null)

    if (!validatePassword()) {
      return
    }

    setIsSubmitting(true)

    try {
      const success = await register(name, email, password)
      if (success) {
        setRegistrationSuccess(true)
        // Nicht zur Hauptseite weiterleiten, da der Benutzer erst bestätigt werden muss
      } else {
        setRegistrationError("Ein Fehler ist aufgetreten bei der Registrierung")
      }
    } catch (error) {
      setRegistrationError("Ein unerwarteter Fehler ist aufgetreten")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-bold">Finance Manager Pro</h1>
          <p className="text-sm text-muted-foreground">Erstelle ein Konto, um deine Finanzen zu verwalten</p>
        </div>

        {registrationSuccess ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <CardTitle>Registrierung erfolgreich!</CardTitle>
                <CardDescription className="text-center">
                  Dein Konto wurde erstellt und wartet auf Bestätigung durch einen Administrator. Du wirst per E-Mail
                  benachrichtigt, sobald dein Konto bestätigt wurde.
                </CardDescription>
                <Button asChild className="mt-4">
                  <Link href="/login">Zur Anmeldeseite</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {registrationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Fehler</AlertTitle>
                <AlertDescription>{registrationError}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Registrieren</CardTitle>
                <CardDescription>Erstelle ein neues Konto</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Max Mustermann"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
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
                  <div className="space-y-2">
                    <Label htmlFor="password">Passwort</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrieren...
                      </>
                    ) : (
                      "Registrieren"
                    )}
                  </Button>
                  <div className="text-center text-sm">
                    Bereits ein Konto?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                      Anmelden
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
