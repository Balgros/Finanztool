"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  approveUser?: (userId: string) => Promise<boolean>
  rejectUser?: (userId: string) => Promise<boolean>
  getAllUsers?: () => User[]
  deleteUser?: (userId: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Admin-Konten, die immer existieren sollen
const ADMIN_USERS = [
  {
    id: "admin-1",
    email: "eser.tavares@gmail.com",
    name: "Admin",
    password: "qwer-1234", // In einer echten App würde das Passwort gehasht sein
    isAdmin: true,
    isApproved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "admin-2",
    email: "Mastrangelo.mariarosa04@gmail.com",
    name: "Maria Rosa",
    password: "Eserichliebedich100%", // In einer echten App würde das Passwort gehasht sein
    isAdmin: true,
    isApproved: true,
    createdAt: new Date().toISOString(),
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Beim ersten Laden prüfen, ob ein Benutzer im localStorage gespeichert ist
    const storedUser = localStorage.getItem("simple-auth-user")

    // Stelle sicher, dass die Admin-Benutzer immer existieren
    ensureAdminsExist()

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
      }
    }
    setIsLoading(false)
  }, [])

  // Stellt sicher, dass die Admin-Benutzer immer existieren
  const ensureAdminsExist = () => {
    const users = JSON.parse(localStorage.getItem("financeUsers") || "[]")

    // Für jeden Admin-Benutzer prüfen, ob er bereits existiert
    for (const adminUser of ADMIN_USERS) {
      const adminExists = users.some((u: any) => u.email === adminUser.email)

      if (!adminExists) {
        users.push(adminUser)
      }
    }

    localStorage.setItem("financeUsers", JSON.stringify(users))
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      // In einer echten App würde hier eine API-Anfrage stattfinden
      const users = JSON.parse(localStorage.getItem("financeUsers") || "[]")
      const foundUser = users.find((u: any) => u.email === email)

      if (!foundUser) {
        toast({
          title: "Fehler bei der Anmeldung",
          description: "Benutzer nicht gefunden",
          variant: "destructive",
        })
        setIsLoading(false)
        throw new Error("Anmeldung fehlgeschlagen")
      }

      // Einfacher Passwortvergleich (in einer echten App würde man Hashing verwenden)
      if (foundUser.password !== password) {
        toast({
          title: "Fehler bei der Anmeldung",
          description: "Falsches Passwort",
          variant: "destructive",
        })
        setIsLoading(false)
        throw new Error("Anmeldung fehlgeschlagen")
      }

      // Prüfen, ob der Benutzer bestätigt wurde (Admin ist immer bestätigt)
      if (!foundUser.isApproved && !foundUser.isAdmin) {
        toast({
          title: "Konto nicht bestätigt",
          description: "Dein Konto wurde noch nicht vom Administrator bestätigt.",
          variant: "destructive",
        })
        setIsLoading(false)
        throw new Error("Anmeldung fehlgeschlagen")
      }

      // Benutzer in den State und localStorage setzen
      const loggedInUser = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
      }

      setUser(loggedInUser)
      localStorage.setItem("simple-auth-user", JSON.stringify(loggedInUser))

      toast({
        title: "Erfolgreich angemeldet",
        description: `Willkommen zurück, ${foundUser.name}!`,
      })

      setIsLoading(false)
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Fehler bei der Anmeldung",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)

    try {
      // In einer echten App würde hier eine API-Anfrage stattfinden
      const users = JSON.parse(localStorage.getItem("financeUsers") || "[]")

      // Prüfen, ob die E-Mail-Adresse bereits verwendet wird
      if (users.some((u: any) => u.email === email)) {
        toast({
          title: "Fehler bei der Registrierung",
          description: "Diese E-Mail-Adresse wird bereits verwendet",
          variant: "destructive",
        })
        setIsLoading(false)
        throw new Error("Registrierung fehlgeschlagen")
      }

      // Neuen Benutzer erstellen
      const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        password, // In einer echten App würde man das Passwort hashen
        isAdmin: false,
        isApproved: false, // Standardmäßig nicht bestätigt
        createdAt: new Date().toISOString(),
      }

      // Benutzer speichern
      users.push(newUser)
      localStorage.setItem("financeUsers", JSON.stringify(users))

      toast({
        title: "Registrierung erfolgreich",
        description: "Dein Konto wurde erstellt und wartet auf Bestätigung durch einen Administrator.",
      })

      setIsLoading(false)
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Fehler bei der Registrierung",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("simple-auth-user")
    router.push("/login")
    toast({
      title: "Abgemeldet",
      description: "Du wurdest erfolgreich abgemeldet",
    })
  }

  // Admin-Funktionen
  const approveUser = async (userId: string): Promise<boolean> => {
    if (!user?.isAdmin) {
      toast({
        title: "Zugriff verweigert",
        description: "Du hast keine Berechtigung, diese Aktion durchzuführen",
        variant: "destructive",
      })
      return false
    }

    try {
      const users = JSON.parse(localStorage.getItem("financeUsers") || "[]")
      const updatedUsers = users.map((u: any) => {
        if (u.id === userId) {
          return { ...u, isApproved: true }
        }
        return u
      })

      localStorage.setItem("financeUsers", JSON.stringify(updatedUsers))

      toast({
        title: "Benutzer bestätigt",
        description: "Der Benutzer wurde erfolgreich bestätigt",
      })

      return true
    } catch (error) {
      console.error("Approve user error:", error)
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten",
        variant: "destructive",
      })
      return false
    }
  }

  const rejectUser = async (userId: string): Promise<boolean> => {
    if (!user?.isAdmin) {
      toast({
        title: "Zugriff verweigert",
        description: "Du hast keine Berechtigung, diese Aktion durchzuführen",
        variant: "destructive",
      })
      return false
    }

    try {
      const users = JSON.parse(localStorage.getItem("financeUsers") || "[]")
      const updatedUsers = users.map((u: any) => {
        if (u.id === userId) {
          return { ...u, isApproved: false }
        }
        return u
      })

      localStorage.setItem("financeUsers", JSON.stringify(updatedUsers))

      toast({
        title: "Benutzer abgelehnt",
        description: "Der Benutzer wurde erfolgreich abgelehnt",
      })

      return true
    } catch (error) {
      console.error("Reject user error:", error)
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten",
        variant: "destructive",
      })
      return false
    }
  }

  const getAllUsers = (): User[] => {
    if (!user?.isAdmin) {
      return []
    }

    try {
      const users = JSON.parse(localStorage.getItem("financeUsers") || "[]")
      return users.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
      }))
    } catch (error) {
      console.error("Get all users error:", error)
      return []
    }
  }

  const deleteUser = async (userId: string): Promise<boolean> => {
    if (!user?.isAdmin) {
      toast({
        title: "Zugriff verweigert",
        description: "Du hast keine Berechtigung, diese Aktion durchzuführen",
        variant: "destructive",
      })
      return false
    }

    try {
      const users = JSON.parse(localStorage.getItem("financeUsers") || "[]")
      const updatedUsers = users.filter((u: any) => u.id !== userId)

      localStorage.setItem("financeUsers", JSON.stringify(updatedUsers))

      toast({
        title: "Benutzer gelöscht",
        description: "Der Benutzer wurde erfolgreich gelöscht",
      })

      return true
    } catch (error) {
      console.error("Delete user error:", error)
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten",
        variant: "destructive",
      })
      return false
    }
  }

  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
    approveUser,
    rejectUser,
    getAllUsers,
    deleteUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth muss innerhalb eines AuthProviders verwendet werden")
  }
  return context
}
