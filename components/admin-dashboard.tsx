"use client"

import { cn } from "@/lib/utils"

import { useEffect, useState, type FormEvent } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Trash2, ShieldAlert, Edit, UserCog } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface DisplayUser {
  id: string
  email: string
  name: string
  isAdmin?: boolean
  isApproved?: boolean
}

interface EditUserFormState {
  name: string
  email: string
}

export function AdminDashboard() {
  const { user, getAllUsers, approveUser, rejectUser, deleteUser, updateUserByAdmin } = useAuth()
  const [users, setUsers] = useState<DisplayUser[]>([])
  const [selectedUser, setSelectedUser] = useState<DisplayUser | null>(null)
  const [editUserForm, setEditUserForm] = useState<EditUserFormState>({ name: "", email: "" })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()

  const fetchUsers = () => {
    if (getAllUsers) {
      const allUsersData = getAllUsers()
      setUsers(allUsersData.map((u) => ({ ...u, isAdmin: !!u.isAdmin, isApproved: !!u.isApproved })))
    }
  }

  useEffect(() => {
    if (user?.isAdmin) {
      fetchUsers()
    }
  }, [user, getAllUsers]) // Abhängigkeit getAllUsers hinzugefügt

  const handleApprove = async (userId: string) => {
    if (approveUser) {
      const success = await approveUser(userId)
      if (success) fetchUsers()
    }
  }

  const handleReject = async (userId: string) => {
    if (rejectUser) {
      const success = await rejectUser(userId)
      if (success) fetchUsers()
    }
  }

  const handleDelete = async (userId: string, userName: string) => {
    if (deleteUser) {
      if (window.confirm(`Möchten Sie den Benutzer ${userName} wirklich löschen?`)) {
        const success = await deleteUser(userId)
        if (success) fetchUsers()
      }
    }
  }

  const openEditDialog = (userToEdit: DisplayUser) => {
    setSelectedUser(userToEdit)
    setEditUserForm({ name: userToEdit.name, email: userToEdit.email })
    setIsEditDialogOpen(true)
  }

  const handleEditUserSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !updateUserByAdmin) return

    // Admins sollten nicht über dieses Formular ihre Admin-Rechte oder Genehmigungsstatus ändern.
    // Nur Name und E-Mail sind hier vorgesehen.
    const updates: Partial<Omit<DisplayUser, "id" | "isAdmin" | "isApproved">> = {}
    if (editUserForm.name !== selectedUser.name) {
      updates.name = editUserForm.name
    }
    if (editUserForm.email !== selectedUser.email) {
      updates.email = editUserForm.email
    }

    if (Object.keys(updates).length === 0) {
      toast({ title: "Keine Änderungen", description: "Es wurden keine Änderungen vorgenommen.", variant: "default" })
      setIsEditDialogOpen(false)
      return
    }

    const success = await updateUserByAdmin(selectedUser.id, updates)
    if (success) {
      fetchUsers()
      setIsEditDialogOpen(false)
      toast({ title: "Benutzer aktualisiert", description: `Die Daten für ${selectedUser.name} wurden geändert.` })
    } else {
      // Fehlermeldung kommt vom updateUserByAdmin Hook
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
  const regularUsers = users.filter((u) => u.isApproved && !u.isAdmin) // Umbenannt von approvedUsers
  const adminUsers = users.filter((u) => u.isAdmin)

  return (
    <div className="space-y-8 p-4 md:p-6">
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
                  <TableHead className="hidden sm:table-cell">E-Mail</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovalUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{u.email}</TableCell>
                    <TableCell className="text-right space-x-1 sm:space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleApprove(u.id)}
                        className="text-green-600 hover:text-green-700 px-2"
                        aria-label={`Benutzer ${u.name} bestätigen`}
                      >
                        <CheckCircle className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Bestätigen</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(u.id, u.name)}
                        className="text-red-600 hover:text-red-700 px-2"
                        aria-label={`Benutzer ${u.name} ablehnen und löschen`}
                      >
                        <Trash2 className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Ablehnen</span>
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
                <TableHead className="hidden md:table-cell">E-Mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...adminUsers, ...regularUsers]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={u.isApproved ? "default" : "outline"}
                        className={cn(
                          u.isApproved
                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
                        )}
                      >
                        {u.isApproved ? "Bestätigt" : "Ausstehend"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.isAdmin ? "secondary" : "outline"} className={cn(u.isAdmin && "font-semibold")}>
                        {u.isAdmin ? "Admin" : "Benutzer"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1 sm:space-x-2">
                      {!u.isAdmin && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(u)}
                            className="text-blue-600 hover:text-blue-700 px-2"
                            aria-label={`Benutzer ${u.name} bearbeiten`}
                          >
                            <Edit className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Bearbeiten</span>
                          </Button>
                          {u.isApproved ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReject(u.id)}
                              className="text-orange-600 hover:text-orange-700 px-2"
                              aria-label={`Benutzer ${u.name} sperren`}
                            >
                              <XCircle className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Sperren</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleApprove(u.id)}
                              className="text-green-600 hover:text-green-700 px-2"
                              aria-label={`Benutzer ${u.name} freischalten`}
                            >
                              <CheckCircle className="h-4 w-4 sm:mr-1" />{" "}
                              <span className="hidden sm:inline">Freischalten</span>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(u.id, u.name)}
                            className="text-red-600 hover:text-red-700 px-2"
                            aria-label={`Benutzer ${u.name} löschen`}
                          >
                            <Trash2 className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Löschen</span>
                          </Button>
                        </>
                      )}
                      {u.isAdmin &&
                        u.id === user?.id && ( // Erlaube dem Admin, sein eigenes (Admin-)Profil zu bearbeiten
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(u)}
                            className="text-blue-600 hover:text-blue-700 px-2"
                            aria-label={`Eigenes Profil bearbeiten`}
                          >
                            <UserCog className="h-4 w-4 sm:mr-1" />{" "}
                            <span className="hidden sm:inline">Eigenes Profil</span>
                          </Button>
                        )}
                      {u.isAdmin && u.id !== user?.id && (
                        <span className="text-xs text-muted-foreground italic px-2">Anderer Admin</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Benutzer bearbeiten: {selectedUser.name}</DialogTitle>
              <DialogDescription>
                Ändern Sie hier die Daten des Benutzers. Klicken Sie auf Speichern, wenn Sie fertig sind.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditUserSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editUserForm.name}
                    onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    E-Mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Abbrechen
                  </Button>
                </DialogClose>
                <Button type="submit">Änderungen speichern</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
