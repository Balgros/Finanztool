"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Home,
  LogOut,
  Menu,
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

  if (!isMounted || !user) {
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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <nav className="grid gap-2 text-lg font-medium">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold" onClick={() => setIsOpen(false)}>
                <Image
                  src="/images/tava-finance-logo.png"
                  width={32}
                  height={32}
                  alt="Finance Manager Logo"
                  className="rounded-md"
                />
                <span className="sr-only">Finance Manager</span>
              </Link>
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
            <div className="mt-auto">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => {
                  setIsOpen(false)
                  logout()
                }}
              >
                <LogOut className="h-5 w-5" />
                Abmelden
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 md:gap-3">
          <Image
            src="/images/tava-finance-logo.png"
            width={32}
            height={32}
            alt="Finance Manager Logo"
            className="rounded-md"
          />
          <span className="font-bold">Finance Manager</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <Button variant="outline" size="sm" className="hidden md:flex" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Abmelden
          </Button>
        </div>
      </header>
      <div className="grid flex-1 md:grid-cols-[220px_1fr]">
        <aside className="hidden border-r bg-muted/40 md:block">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="flex flex-col gap-2 p-4 text-muted-foreground">
              <nav className="grid gap-1">
                {navItems.map((item, index) => (
                  <Link key={index} href={item.href} passHref>
                    <Button variant={item.variant} className="w-full justify-start gap-2" size="sm">
                      {item.icon}
                      {item.title}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
          </ScrollArea>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">{children}</main>
      </div>
    </div>
  )
}
