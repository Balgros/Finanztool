"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Menu,
  X,
  PiggyBank,
  LogOut,
  UserCircle,
  FileText,
  ShieldCheck,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  isActive?: boolean
  isBottom?: boolean
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const authRoutes = ["/login", "/register", "/forgot-password", "/datenschutz", "/impressum"]
    const isAuthRoute = authRoutes.includes(pathname) || pathname.startsWith("/invitation")
    if (isMounted && !user && !isAuthRoute) {
      router.push("/login")
    }
  }, [user, router, isMounted, pathname])

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="p-4 rounded-lg">
          <PiggyBank className="h-12 w-12 text-primary animate-bounce" />
          <p className="mt-2 text-muted-foreground">Lade TavaFinance...</p>
        </div>
      </div>
    )
  }

  const authRoutes = ["/login", "/register", "/forgot-password", "/datenschutz", "/impressum"]
  const isAuthRoute = authRoutes.includes(pathname) || pathname.startsWith("/invitation")

  if (isAuthRoute && !user) {
    return <>{children}</>
  }

  if (!user && !isAuthRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="p-4 rounded-lg">
          <PiggyBank className="h-12 w-12 text-primary animate-pulse" />
          <p className="mt-2 text-muted-foreground">Weiterleitung zum Login...</p>
        </div>
      </div>
    )
  }

  const navItems: NavItem[] = [
    { title: "Dashboard", href: "/", icon: <Home size={20} />, isActive: pathname === "/" },
    { title: "Einnahmen", href: "/einnahmen", icon: <CreditCard size={20} />, isActive: pathname === "/einnahmen" },
    { title: "Ausgaben", href: "/ausgaben", icon: <DollarSign size={20} />, isActive: pathname === "/ausgaben" },
    {
      title: "Überträge",
      href: "/uebertraege",
      icon: <ArrowLeftRight size={20} />,
      isActive: pathname === "/uebertraege",
    },
    {
      title: "Wiederkehrend",
      href: "/wiederkehrend",
      icon: <RefreshCw size={20} />,
      isActive: pathname === "/wiederkehrend",
    },
    { title: "Konten", href: "/konten", icon: <Package size={20} />, isActive: pathname === "/konten" },
    { title: "Budgets", href: "/budgets", icon: <BarChart3 size={20} />, isActive: pathname === "/budgets" },
    { title: "Kategorien", href: "/kategorien", icon: <PieChart size={20} />, isActive: pathname === "/kategorien" },
    { title: "Personen", href: "/personen", icon: <Users size={20} />, isActive: pathname === "/personen" },
    { title: "Familie", href: "/familie", icon: <Users size={20} />, isActive: pathname === "/familie" },
    { title: "Berichte", href: "/berichte", icon: <BarChart3 size={20} />, isActive: pathname === "/berichte" },
    { title: "Prognose", href: "/forecast", icon: <TrendingUp size={20} />, isActive: pathname === "/forecast" },
    ...(user?.isAdmin
      ? [{ title: "Admin", href: "/admin", icon: <ShieldCheck size={20} />, isActive: pathname === "/admin" }]
      : []),
    {
      title: "Einstellungen",
      href: "/einstellungen",
      icon: <Settings size={20} />,
      isActive: pathname === "/einstellungen",
      isBottom: true,
    },
  ]

  const topNavItems = navItems.filter((item) => !item.isBottom)
  const bottomNavItems = navItems.filter((item) => item.isBottom)

  if (isAuthRoute && user && (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password")) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-muted/40">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex-col border-r bg-background transition-transform duration-300 ease-in-out md:static md:flex md:w-64 ${isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex h-16 items-center border-b px-6 shrink-0">
          <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
            <PiggyBank className="h-7 w-7" />
            <span className="text-lg">TavaFinance</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="flex flex-col justify-between h-[calc(100vh-4rem)] px-4">
            {" "}
            {/* Adjust height for header */}
            <ul className="space-y-1">
              {topNavItems.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all
                      ${
                        item.isActive
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="space-y-1 mt-auto pt-4 border-t">
              {bottomNavItems.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all
                      ${
                        item.isActive
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/impressum"
                  onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-muted-foreground hover:bg-muted hover:text-foreground ${pathname === "/impressum" ? "bg-muted text-foreground" : ""}`}
                >
                  <FileText size={20} /> Impressum
                </Link>
              </li>
              <li>
                <Link
                  href="/datenschutz"
                  onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-muted-foreground hover:bg-muted hover:text-foreground ${pathname === "/datenschutz" ? "bg-muted text-foreground" : ""}`}
                >
                  <Shield size={20} /> Datenschutz
                </Link>
              </li>
            </ul>
          </nav>
        </ScrollArea>
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menü öffnen/schließen"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          {user ? (
            <div className="flex items-center gap-4">
              <UserCircle className="h-7 w-7 text-muted-foreground" />
              <span className="text-sm font-medium hidden sm:inline">Hallo, {user.name || user.email}</span>
              <Button variant="ghost" size="icon" onClick={logout} aria-label="Abmelden">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Anmelden</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Registrieren</Link>
              </Button>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
