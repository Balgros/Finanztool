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
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isPendingApproval, setIsPendingApproval] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setLoginError(null)
    setIsPendingApproval(false)

    try {
      // Prüfen, ob der Benutzer existiert und das Passwort korrekt ist
      const users = JSON.parse(localStorage.getItem("financeUsers") || "[]")
      const foundUser = users.find((u: any) => u.email === email)

      if (!foundUser) {
        setLoginError("Benutzer nicht gefunden")
        setIsSubmitting(false)
        return
      }

      if (foundUser.password !== password) {
        setLoginError("Falsches Passwort")
        setIsSubmitting(false)
        return
      }

      // Prüfen, ob der Benutzer bestätigt wurde
      if (!foundUser.isApproved && !foundUser.isAdmin) {
        setIsPendingApproval(true)
        setIsSubmitting(false)
        return
      }

      const success = await login(email, password)
      if (success) {
        if (foundUser.isAdmin) {
          router.push("/admin")
        } else {
          router.push("/")
        }
      } else {
        setLoginError("Ein Fehler ist aufgetreten")
      }
    } catch (error) {
      setLoginError("Ein unerwarteter Fehler ist aufgetreten")
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
          <p className="text-sm text-muted-foreground">Melde dich an, um deine Finanzen zu verwalten</p>
        </div>

        {isPendingApproval && (
          <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Konto wartet auf Bestätigung</AlertTitle>
            <AlertDescription>
              Dein Konto wurde noch nicht vom Administrator bestätigt. Bitte versuche es später erneut.
            </AlertDescription>
          </Alert>
        )}

        {loginError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fehler</AlertTitle>
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Anmelden</CardTitle>
            <CardDescription>Gib deine Anmeldedaten ein, um fortzufahren</CardDescription>
          </CardHeader>
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Passwort</Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    Passwort vergessen?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Anmelden...
                  </>
                ) : (
                  "Anmelden"
                )}
              </Button>
              <div className="text-center text-sm">
                Noch kein Konto?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Registrieren
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
