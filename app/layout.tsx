import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { FinanceProvider } from "@/context/finance-context"
import { Toaster } from "@/components/ui/toaster"
import MainLayout from "@/components/main-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TavaFinance",
  description: "Einfache Finanzverwaltung für den Alltag.",
  icons: {
    icon: "/favicon.ico",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <FinanceProvider>
              <MainLayout>{children}</MainLayout>
              <Toaster />
            </FinanceProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
