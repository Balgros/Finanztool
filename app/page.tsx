"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useFinance } from "@/context/finance-context"
import { MainLayout } from "@/components/main-layout"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const { user, isLoading } = useAuth()
  const { generateRecurringIncomes } = useFinance()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Prüfe auf wiederkehrende Transaktionen beim App-Start
  useEffect(() => {
    if (user) {
      generateRecurringIncomes()
    }
  }, [user])

  if (isLoading || !user) {
    return null
  }

  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  )
}
