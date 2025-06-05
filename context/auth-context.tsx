"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
  isAdmin?: boolean // isAdmin hinzugefügt
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  approveUser?: (userId: string) => Promise<boolean>
  rejectUser?: (userId: string) => Promise<boolean>
  getAllUsers?: () => User[] // Typ angepasst
  deleteUser?: (userId: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ADMIN_USERS_CONFIG = [
  {
    id: "admin-1",
    email: "eser.tavares@gmail.com",
    name: "Admin Eser", // Name geändert für Klarheit
    password: "qwer-1234",
    isAdmin: true,
    isApproved: true,
  },
  {
    id: "admin-2",
    email: "Mastrangelo.mariarosa04@gmail.com",
    name: "Admin Maria", // Name geändert für Klarheit
    password: "Eserichliebedich100%",
    isAdmin: true,
    isApproved: true,
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  const getUsersFromStorage = () => {
    try {
      return JSON.parse(localStorage.getItem("financeUsers") || "[]")
    } catch (e) {
      return []
    }
  }

  const saveUsersToStorage = (users: any[]) => {
    localStorage.setItem("financeUsers", JSON.stringify(users))
  }

  useEffect(() => {
    const ensureAdminsExist = () => {
      const users = getUsersFromStorage()
      let adminsChanged = false
      for (const adminConfig of ADMIN_USERS_CONFIG) {
        const existingAdmin = users.find((u: any) => u.email === adminConfig.email)
        if (!existingAdmin) {
          users.push({ ...adminConfig, createdAt: new Date().toISOString() })
          adminsChanged = true
        } else if (!existingAdmin.isAdmin || !existingAdmin.isApproved) {
          // Ensure admin flags are correctly set if user exists
          existingAdmin.isAdmin = true
          existingAdmin.isApproved = true
          adminsChanged = true
        }
      }
      if (adminsChanged) {
        saveUsersToStorage(users)
      }
    }

    ensureAdminsExist()

    const storedUser = localStorage.getItem("simple-auth-user")
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser)
        // Verify if this user still exists and is valid (especially admin status)
        const allUsers = getUsersFromStorage()
        const validUser = allUsers.find((u: any) => u.id === parsedUser.id)
        if (validUser) {
          setUser({ ...parsedUser, isAdmin: validUser.isAdmin }) // Ensure isAdmin is fresh
        } else {
          localStorage.removeItem("simple-auth-user") // Stale user
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("simple-auth-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const users = getUsersFromStorage()
      const foundUser = users.find((u: any) => u.email === email)

      if (!foundUser) {
        toast({ title: "Fehler", description: "Benutzer nicht gefunden.", variant: "destructive" })
        setIsLoading(false)
        return
      }
      if (foundUser.password !== password) {
        toast({ title: "Fehler", description: "Falsches Passwort.", variant: "destructive" })
        setIsLoading(false)
        return
      }
      if (!foundUser.isApproved) {
        toast({
          title: "Konto nicht bestätigt",
          description: "Dein Konto wartet auf Bestätigung.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const loggedInUser: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        isAdmin: foundUser.isAdmin,
      }
      setUser(loggedInUser)
      localStorage.setItem("simple-auth-user", JSON.stringify(loggedInUser))
      toast({ title: "Angemeldet", description: `Willkommen, ${foundUser.name}!` })
      router.push("/")
    } catch (error) {
      console.error("Login error:", error)
      toast({ title: "Fehler", description: "Anmeldung fehlgeschlagen.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const users = getUsersFromStorage()
      if (users.some((u: any) => u.email === email)) {
        toast({ title: "Fehler", description: "E-Mail bereits registriert.", variant: "destructive" })
        setIsLoading(false)
        return
      }
      const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        password,
        isAdmin: false,
        isApproved: false,
        createdAt: new Date().toISOString(),
      }
      users.push(newUser)
      saveUsersToStorage(users)
      toast({ title: "Registrierung erfolgreich", description: "Dein Konto wartet auf Bestätigung." })
      router.push("/login")
    } catch (error) {
      console.error("Registration error:", error)
      toast({ title: "Fehler", description: "Registrierung fehlgeschlagen.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("simple-auth-user")
    router.push("/login")
    toast({ title: "Abgemeldet", description: "Du wurdest erfolgreich abgemeldet." })
  }

  const approveUser = async (userId: string): Promise<boolean> => {
    if (!user?.isAdmin) {
      toast({ title: "Fehler", description: "Keine Adminrechte.", variant: "destructive" })
      return false
    }
    try {
      const users = getUsersFromStorage()
      const userIndex = users.findIndex((u: any) => u.id === userId)
      if (userIndex === -1) return false
      users[userIndex].isApproved = true
      saveUsersToStorage(users)
      toast({ title: "Erfolg", description: "Benutzer bestätigt." })
      return true
    } catch (e) {
      return false
    }
  }

  const rejectUser = async (userId: string): Promise<boolean> => {
    if (!user?.isAdmin) {
      toast({ title: "Fehler", description: "Keine Adminrechte.", variant: "destructive" })
      return false
    }
    try {
      const users = getUsersFromStorage()
      const userIndex = users.findIndex((u: any) => u.id === userId)
      if (userIndex === -1) return false
      users[userIndex].isApproved = false // Set to false, or could delete if reject means remove pending
      saveUsersToStorage(users)
      toast({ title: "Erfolg", description: "Benutzerstatus geändert (nicht bestätigt)." })
      return true
    } catch (e) {
      return false
    }
  }

  const getAllUsers = (): User[] => {
    if (!user?.isAdmin) return []
    const users = getUsersFromStorage()
    return users.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      isAdmin: u.isAdmin,
      isApproved: u.isApproved,
    })) // include isApproved
  }

  const deleteUser = async (userId: string): Promise<boolean> => {
    if (!user?.isAdmin) {
      toast({ title: "Fehler", description: "Keine Adminrechte.", variant: "destructive" })
      return false
    }
    // Prevent admin from deleting themselves or other admins for simplicity here
    const userToDelete = getUsersFromStorage().find((u: any) => u.id === userId)
    if (userToDelete && userToDelete.isAdmin) {
      toast({ title: "Fehler", description: "Admins können nicht gelöscht werden.", variant: "destructive" })
      return false
    }

    try {
      let users = getUsersFromStorage()
      users = users.filter((u: any) => u.id !== userId)
      saveUsersToStorage(users)
      toast({ title: "Erfolg", description: "Benutzer gelöscht." })
      return true
    } catch (e) {
      return false
    }
  }

  const value = { user, isLoading, login, register, logout, approveUser, rejectUser, getAllUsers, deleteUser }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth muss innerhalb eines AuthProviders verwendet werden")
  }
  return context
}
