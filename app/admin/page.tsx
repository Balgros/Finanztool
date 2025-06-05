"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Trash2, AlertCircle, Mail } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getSentEmails } from "@/services/email-service"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function AdminPage() {
  const { user, isLoading, getAllUsers, approveUser, rejectUser, deleteUser } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("pending")
  const [sentEmails, setSentEmails] = useState<any[]>([])
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/")
    } else if (user?.isAdmin) {
      refreshUsers()
      refreshEmails()
    }
  }, [user, isLoading, router])

  const refreshUsers = () => {
    setIsRefreshing(true)
    const allUsers = getAllUsers()
    setUsers(allUsers)
    setIsRefreshing(false)
  }

  const refreshEmails = () => {
    const emails = getSentEmails()
    setSentEmails(emails)
  }

  const handleApprove = async (userId: string) => {
    const success = await approveUser(userId)
    if (success) {
      refreshUsers()
    }
  }

  const handleReject = async (userId: string) => {
    const success = await rejectUser(userId)
    if (success) {
      refreshUsers()
    }
  }

  const handleDelete = async () => {
    if (userToDelete) {
      const success = await deleteUser(userToDelete)
      if (success) {
        refreshUsers()
      }
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const confirmDelete = (userId: string) => {
    setUserToDelete(userId)
    setDeleteDialogOpen(true)
  }

  const viewEmail = (email: any) => {
    setSelectedEmail(email)
    setEmailDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (isLoading || !user?.isAdmin) {
    return null
  }

  const pendingUsers = users.filter((u) => !u.isApproved && !u.isAdmin)
  const approvedUsers = users.filter((u) => u.isApproved && !u.isAdmin)
  const adminUsers = users.filter((u) => u.isAdmin)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Admin-Bereich</h1>
          <div className="flex gap-2">
            <Button onClick={refreshUsers} disabled={isRefreshing}>
              {isRefreshing ? "Wird aktualisiert..." : "Aktualisieren"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Benutzerverwaltung</TabsTrigger>
            <TabsTrigger value="emails">E-Mail-Protokoll</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Benutzerverwaltung</CardTitle>
                <CardDescription>Verwalte Benutzerkonten und Zugriffsberechtigungen</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending" onValueChange={setActiveTab} value={activeTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="pending">
                      Ausstehend <Badge className="ml-2 bg-amber-500">{pendingUsers.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="approved">
                      Bestätigt <Badge className="ml-2 bg-green-500">{approvedUsers.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="admins">
                      Administratoren <Badge className="ml-2 bg-blue-500">{adminUsers.length}</Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending">
                    {pendingUsers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">Keine ausstehenden Benutzer</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>E-Mail</TableHead>
                            <TableHead>Registriert am</TableHead>
                            <TableHead>Aktionen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{formatDate(user.createdAt)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-500 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleApprove(user.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" /> Bestätigen
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleReject(user.id)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" /> Ablehnen
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    onClick={() => confirmDelete(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  <TabsContent value="approved">
                    {approvedUsers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">Keine bestätigten Benutzer</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>E-Mail</TableHead>
                            <TableHead>Registriert am</TableHead>
                            <TableHead>Aktionen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {approvedUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{formatDate(user.createdAt)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                                    onClick={() => handleReject(user.id)}
                                  >
                                    <AlertCircle className="h-4 w-4 mr-1" /> Zugriff entziehen
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    onClick={() => confirmDelete(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  <TabsContent value="admins">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>E-Mail</TableHead>
                          <TableHead>Registriert am</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell>
                              <Badge className="bg-blue-500">Administrator</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>E-Mail-Protokoll</CardTitle>
                <CardDescription>Übersicht über alle simulierten E-Mails</CardDescription>
              </CardHeader>
              <CardContent>
                {sentEmails.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Keine E-Mails gesendet</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empfänger</TableHead>
                        <TableHead>Betreff</TableHead>
                        <TableHead>Gesendet am</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sentEmails.map((email) => (
                        <TableRow key={email.id}>
                          <TableCell>{email.to}</TableCell>
                          <TableCell>{email.subject}</TableCell>
                          <TableCell>{formatDate(email.sentAt)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => viewEmail(email)}>
                              <Mail className="h-4 w-4 mr-1" /> Anzeigen
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Benutzer löschen</DialogTitle>
            <DialogDescription>
              Bist du sicher, dass du diesen Benutzer löschen möchtest? Diese Aktion kann nicht rückgängig gemacht
              werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>E-Mail-Details</DialogTitle>
            <DialogDescription>Details der simulierten E-Mail</DialogDescription>
          </DialogHeader>

          {selectedEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">Empfänger:</p>
                  <p className="text-sm">{selectedEmail.to}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Gesendet am:</p>
                  <p className="text-sm">{formatDate(selectedEmail.sentAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Betreff:</p>
                <p className="text-sm">{selectedEmail.subject}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Inhalt:</p>
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <pre className="text-sm whitespace-pre-wrap">{selectedEmail.body}</pre>
                </ScrollArea>
              </div>

              <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                Hinweis: Dies ist eine Simulation. In einer echten Anwendung würde diese E-Mail an den Empfänger
                gesendet werden.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setEmailDialogOpen(false)}>Schließen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
