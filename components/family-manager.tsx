"use client"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FamilyMemberForm } from "@/components/forms/family-member-form"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { UserPlus, UserX, UserCog, RefreshCw, Clock, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { sendEmail, emailTemplates, generateInvitationToken, storeInvitationToken } from "@/services/email-service"
import type { FamilyMember } from "@/types/finance"

export function FamilyManager() {
  const { data, addFamilyMember, updateFamilyMember, deleteFamilyMember } = useFinance()
  const { user } = useAuth()
  const { toast } = useToast()
  const familyMembers = data?.familyMembers || []

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null)
  const [isResending, setIsResending] = useState(false)

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false)
  }

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    setSelectedMember(null)
  }

  const handleDelete = () => {
    if (selectedMember) {
      deleteFamilyMember(selectedMember.id)
      setIsDeleteDialogOpen(false)
      setSelectedMember(null)
    }
  }

  const handleResendInvitation = async (member: FamilyMember) => {
    setIsResending(true)
    try {
      // Generiere einen neuen Token
      const token = generateInvitationToken()

      // Speichere den Token
      storeInvitationToken(member.email, token)

      // Aktualisiere das Familienmitglied mit dem neuen Token
      updateFamilyMember({
        ...member,
        invitationToken: token,
        invitationDate: new Date().toISOString(),
      })

      // Sende eine neue Einladungs-E-Mail
      const appUrl = window.location.origin
      const emailTemplate = emailTemplates.familyMemberInvitation(
        user?.name || "Ein Benutzer",
        member.email,
        member.relation,
        appUrl,
        token,
      )

      await sendEmail({
        to: member.email,
        subject: emailTemplate.subject,
        body: emailTemplate.body,
      })

      toast({
        title: "Einladung erneut gesendet",
        description: `Eine neue Einladung wurde an ${member.email} gesendet.`,
      })
    } catch (error) {
      console.error("Fehler beim erneuten Senden der Einladung:", error)
      toast({
        title: "Fehler",
        description: "Die Einladung konnte nicht erneut gesendet werden.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  const getStatusBadge = (status: FamilyMember["invitationStatus"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Ausstehend
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Akzeptiert
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Abgelehnt
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Familienmitglieder</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Mitglied hinzufügen
        </Button>
      </div>

      {familyMembers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Keine Familienmitglieder vorhanden</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-4">
            {familyMembers.map((member) => (
              <Card key={member.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{member.name}</CardTitle>
                      <CardDescription>{member.email}</CardDescription>
                    </div>
                    {getStatusBadge(member.invitationStatus)}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-sm font-medium">Beziehung:</span>{" "}
                      <span className="text-sm">
                        {member.relation === "spouse"
                          ? "Partner/in"
                          : member.relation === "child"
                            ? "Kind"
                            : member.relation === "parent"
                              ? "Elternteil"
                              : member.relation === "sibling"
                                ? "Geschwister"
                                : "Andere"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Berechtigungen:</span>{" "}
                      <span className="text-sm">
                        {member.canView && member.canEdit
                          ? "Ansehen & Bearbeiten"
                          : member.canView
                            ? "Nur Ansehen"
                            : "Keine"}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {member.invitationStatus === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendInvitation(member)}
                      disabled={isResending}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {isResending ? "Wird gesendet..." : "Einladung erneut senden"}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedMember(member)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <UserCog className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedMember(member)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Entfernen
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Dialog zum Hinzufügen eines Familienmitglieds */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Familienmitglied hinzufügen</DialogTitle>
            <DialogDescription>
              Fügen Sie ein Familienmitglied hinzu und laden Sie es ein, Ihre Finanzdaten zu teilen.
            </DialogDescription>
          </DialogHeader>
          <FamilyMemberForm onSuccess={handleAddSuccess} />
        </DialogContent>
      </Dialog>

      {/* Dialog zum Bearbeiten eines Familienmitglieds */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Familienmitglied bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Informationen und Berechtigungen des Familienmitglieds.
            </DialogDescription>
          </DialogHeader>
          {selectedMember && <FamilyMemberForm member={selectedMember} onSuccess={handleEditSuccess} />}
        </DialogContent>
      </Dialog>

      {/* Dialog zum Löschen eines Familienmitglieds */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Familienmitglied entfernen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie dieses Familienmitglied entfernen möchten? Diese Aktion kann nicht rückgängig
              gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Entfernen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
