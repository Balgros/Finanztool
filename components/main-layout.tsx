"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Home,
  Package,
  PieChart,
  Settings,
  Users,
  ArrowLeftRight,
  RefreshCw,
  TrendingUp,
  Shield,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  variant: "default" | "ghost"
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  // Verhindere Hydration-Fehler
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Überprüfe, ob der Benutzer eingeloggt ist
  useEffect(() => {
    if (isMounted && !user) {
      router.push("/login")
    }
  }, [user, router, isMounted])

  if (!isMounted) {
    return null
  }

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: <Home className="h-5 w-5" />,
      variant: pathname === "/" ? "default" : "ghost",
    },
    {
      title: "Ausgaben",
      href: "/ausgaben",
      icon: <DollarSign className="h-5 w-5" />,
      variant: pathname === "/ausgaben" ? "default" : "ghost",
    },
    {
      title: "Einnahmen",
      href: "/einnahmen",
      icon: <CreditCard className="h-5 w-5" />,
      variant: pathname === "/einnahmen" ? "default" : "ghost",
    },
    {
      title: "Überträge",
      href: "/uebertraege",
      icon: <ArrowLeftRight className="h-5 w-5" />,
      variant: pathname === "/uebertraege" ? "default" : "ghost",
    },
    {
      title: "Wiederkehrend",
      href: "/wiederkehrend",
      icon: <RefreshCw className="h-5 w-5" />,
      variant: pathname === "/wiederkehrend" ? "default" : "ghost",
    },
    {
      title: "Konten",
      href: "/konten",
      icon: <Package className="h-5 w-5" />,
      variant: pathname === "/konten" ? "default" : "ghost",
    },
    {
      title: "Kategorien",
      href: "/kategorien",
      icon: <PieChart className="h-5 w-5" />,
      variant: pathname === "/kategorien" ? "default" : "ghost",
    },
    {
      title: "Personen",
      href: "/personen",
      icon: <Users className="h-5 w-5" />,
      variant: pathname === "/personen" ? "default" : "ghost",
    },
    {
      title: "Familie",
      href: "/familie",
      icon: <Users className="h-5 w-5" />,
      variant: pathname === "/familie" ? "default" : "ghost",
    },
    {
      title: "Budgets",
      href: "/budgets",
      icon: <BarChart3 className="h-5 w-5" />,
      variant: pathname === "/budgets" ? "default" : "ghost",
    },
    {
      title: "Berichte",
      href: "/berichte",
      icon: <BarChart3 className="h-5 w-5" />,
      variant: pathname === "/berichte" ? "default" : "ghost",
    },
    {
      title: "Prognose",
      href: "/forecast",
      icon: <TrendingUp className="h-5 w-5" />,
      variant: pathname === "/forecast" ? "default" : "ghost",
    },
    ...(user?.isAdmin
      ? [
          {
            title: "Admin",
            href: "/admin",
            icon: <Shield className="h-5 w-5" />,
            variant: pathname === "/admin" ? "default" : "ghost",
          },
        ]
      : []),
    {
      title: "Einstellungen",
      href: "/einstellungen",
      icon: <Settings className="h-5 w-5" />,
      variant: pathname === "/einstellungen" ? "default" : "ghost",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            TavaFinance
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <span>Hallo, {user.name}</span>
              <Button variant="outline" onClick={logout}>
                Abmelden
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/login">Anmelden</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Registrieren</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TavaFinance. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  )
}
