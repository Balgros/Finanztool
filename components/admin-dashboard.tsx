"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Trash2, ShieldAlert } from "lucide-react"

interface DisplayUser {
  id: string
  email: string
  name: string
  isAdmin?: boolean
  isApproved?: boolean // Hinzugefügt für den Status
}

export function AdminDashboard() {
  const { user, getAllUsers, approveUser, rejectUser, deleteUser } = useAuth()
  const [users, setUsers] = useState<DisplayUser[]>([])

  const fetchUsers = () => {
    if (getAllUsers) {
      const allUsersData = getAllUsers()
      // Stellen Sie sicher, dass isApproved und isAdmin immer definiert sind (ggf. als false)
      setUsers(allUsersData.map((u) => ({ ...u, isAdmin: !!u.isAdmin, isApproved: !!u.isApproved })))
    }
  }

  useEffect(() => {
    if (user?.isAdmin) {
      fetchUsers()
    }
  }, [user, getAllUsers])

  const handleApprove = async (userId: string) => {
    if (approveUser) {
      const success = await approveUser(userId)
      if (success) fetchUsers() // Refresh user list
    }
  }

  const handleReject = async (userId: string) => {
    if (rejectUser) {
      const success = await rejectUser(userId)
      if (success) fetchUsers() // Refresh user list
    }
  }

  const handleDelete = async (userId: string, userName: string) => {
    if (deleteUser) {
      if (
        window.confirm(
          `Möchten Sie den Benutzer ${userName} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
        )
      ) {
        const success = await deleteUser(userId)
        if (success) fetchUsers() // Refresh user list
      }
    }
  }

  if (!user?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Zugriff verweigert</h1>
        <p className="text-muted-foreground">Sie haben keine Berechtigung, auf diese Seite zuzugreifen.</p>
      </div>
    )
  }

  const pendingApprovalUsers = users.filter((u) => !u.isApproved && !u.isAdmin)
  const approvedUsers = users.filter((u) => u.isApproved && !u.isAdmin)
  const adminUsers = users.filter((u) => u.isAdmin)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

      {pendingApprovalUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ausstehende Bestätigungen</CardTitle>
            <CardDescription>Diese Benutzer warten auf Ihre Bestätigung.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovalUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleApprove(u.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Bestätigen
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(u.id, u.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="mr-1 h-4 w-4" /> Ablehnen & Löschen
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Benutzerverwaltung</CardTitle>
          <CardDescription>Verwalten Sie alle registrierten Benutzer.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...adminUsers, ...approvedUsers].map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={u.isApproved ? "default" : "destructive"}
                      className={u.isApproved ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      {u.isApproved ? "Bestätigt" : "Ausstehend"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isAdmin ? "secondary" : "outline"}>{u.isAdmin ? "Admin" : "Benutzer"}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {!u.isAdmin && ( // Admins können nicht von anderen Admins manipuliert werden (außer sich selbst löschen)
                      <>
                        {u.isApproved ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReject(u.id)}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <XCircle className="mr-1 h-4 w-4" /> Sperren
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApprove(u.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="mr-1 h-4 w-4" /> Freischalten
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(u.id, u.name)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Löschen
                        </Button>
                      </>
                    )}
                    {u.isAdmin && <span className="text-xs text-muted-foreground italic">Admin-Konto</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
