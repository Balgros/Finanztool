"use client"

// Diese Seite wird jetzt durch MainLayout umschlossen,
// und die Logik für Auth-Weiterleitung etc. ist in MainLayout.
// HomePage zeigt das Dashboard, wenn der Benutzer eingeloggt ist.
import { Dashboard } from "@/components/dashboard"

export default function HomePage() {
  return <Dashboard />
}
