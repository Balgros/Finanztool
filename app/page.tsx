"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Dashboard } from "@/components/dashboard"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Wird geladen...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      <header className="border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">TavaFinance</h1>
          <div className="flex items-center gap-4">
            <span>Hallo, {user.name}</span>
            <Button variant="outline" onClick={logout}>
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Dashboard />
      </main>
    </div>
  )
}
