"use client"

import type React from "react"

import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button" // Sicherstellen, dass Button importiert ist
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // Sicherstellen, dass Sheet-Komponenten importiert sind
import {
  Menu,
  LogOut,
  Settings,
  UserCircle,
  Shield,
  Home,
  TrendingUp,
  Repeat,
  Users,
  FileText,
  BarChart3,
  Landmark,
  ArrowRightLeft,
} from "lucide-react" // Palette für Theme hinzugefügt
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"
import { usePathname } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
}

interface MainLayoutProps {
  children: ReactNode
}

const navItems: NavItem[] = [
  {
    href: "/",
    icon: <Home className="h-5 w-5" />,
    label: "Dashboard",
  },
  {
    href: "/trending",
    icon: <TrendingUp className="h-5 w-5" />,
    label: "Trending",
  },
  {
    href: "/replays",
    icon: <Repeat className="h-5 w-5" />,
    label: "Replays",
  },
  {
    href: "/community",
    icon: <Users className="h-5 w-5" />,
    label: "Community",
  },
  {
    href: "/blog",
    icon: <FileText className="h-5 w-5" />,
    label: "Blog",
  },
  {
    href: "/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    label: "Analytics",
  },
  {
    href: "/landmarks",
    icon: <Landmark className="h-5 w-5" />,
    label: "Landmarks",
  },
  {
    href: "/transfers",
    icon: <ArrowRightLeft className="h-5 w-5" />,
    label: "Transfers",
  },
  // {
  //   href: "/einstellungen/darstellung",
  //   icon: <Palette className="h-5 w-5" />,
  //   label: "Darstellung",
  // },
]

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  return (
    <div className="flex h-screen">
      {/* Sidebar (Desktop) */}
      <aside className="hidden w-64 border-r bg-gray-100 dark:bg-gray-900 dark:border-gray-800 md:block">
        <div className="flex flex-col h-full">
          <div className="p-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.svg" alt="Logo" width={32} height={32} className="dark:invert" />
              <span className="font-bold text-lg">Your App</span>
            </Link>
          </div>
          <ScrollArea className="flex-1">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700",
                    pathname === item.href ? "bg-gray-200 dark:bg-gray-700" : "",
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </ScrollArea>
        </div>
      </aside>

      {/* Mobile Navigation Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Menü öffnen</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="p-4">
              <Link href="/" className="flex items-center space-x-2">
                <Image src="/logo.svg" alt="Logo" width={32} height={32} className="dark:invert" />
                <span className="font-bold text-lg">Your App</span>
              </Link>
            </div>
            <ScrollArea className="flex-1">
              <nav className="p-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700",
                      pathname === item.href ? "bg-gray-200 dark:bg-gray-700" : "",
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="h-16 border-b bg-white dark:bg-gray-800 dark:border-gray-700 flex items-center justify-between p-4">
          <div>Header Content</div>
          <div className="flex items-center gap-2 md:gap-4">
            <ModeToggle />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <UserCircle className="h-6 w-6" />
                    <span className="sr-only">Benutzermenü öffnen</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/einstellungen">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Einstellungen</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Abmelden</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  )
}
