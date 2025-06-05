"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { PiggyBank, UserPlus } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { register, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/") // Weiterleiten zum Dashboard, wenn bereits eingeloggt
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("Passwörter stimmen nicht überein!") // Einfache Validierung, Shadcn Toast wäre besser
      return
    }
    await register(name, email, password)
  }

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <PiggyBank className="h-12 w-12 animate-pulse text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <UserPlus size={32} />
          </div>
          <CardTitle className="text-3xl font-bold">Konto erstellen</CardTitle>
          <CardDescription>Werden Sie Teil von TavaFinance.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Vollständiger Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Max Mustermann"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 text-base"
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
                className="h-11 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11 text-base"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
              {isLoading ? "Registrieren..." : "Registrieren"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-3 pt-6">
          <p className="text-sm text-muted-foreground">
            Bereits ein Konto?{" "}
            <Link href="/login" passHref>
              <Button variant="link" className="p-0 h-auto font-semibold">
                Jetzt anmelden
              </Button>
            </Link>
          </p>
          <div className="flex space-x-4 text-xs text-muted-foreground">
            <Link href="/impressum" passHref>
              <Button variant="link" size="sm" className="p-0 h-auto">
                Impressum
              </Button>
            </Link>
            <Link href="/datenschutz" passHref>
              <Button variant="link" size="sm" className="p-0 h-auto">
                Datenschutz
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
