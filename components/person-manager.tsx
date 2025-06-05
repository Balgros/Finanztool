"use client"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { PersonForm } from "@/components/forms/person-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Pencil, Trash, UserPlus, Mail } from "lucide-react"
import type { Person, FamilyMember } from "@/types/finance"
import { FamilyMemberForm } from "@/components/forms/family-member-form"

export function PersonManager() {
  const { data, deletePerson, deleteFamilyMember } = useFinance()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentPerson, setCurrentPerson] = useState<Person | null>(null)

  const [isAddFamilyMemberDialogOpen, setIsAddFamilyMemberDialogOpen] = useState(false)
  const [isEditFamilyMemberDialogOpen, setIsEditFamilyMemberDialogOpen] = useState(false)
  const [currentFamilyMember, setCurrentFamilyMember] = useState<FamilyMember | null>(null)

  const handleEditPerson = (person: Person) => {
    setCurrentPerson(person)
    setIsEditDialogOpen(true)
  }

  const handleDeletePerson = (id: string) => {
    if (window.confirm("Möchtest du diese Person wirklich löschen?")) {
      deletePerson(id)
    }
  }

  const handleEditFamilyMember = (member: FamilyMember) => {
    setCurrentFamilyMember(member)
    setIsEditFamilyMemberDialogOpen(true)
  }

  const handleDeleteFamilyMember = (id: string) => {
    if (window.confirm("Möchtest du dieses Familienmitglied wirklich löschen?")) {
      deleteFamilyMember(id)
    }
  }

  const handleSendInvitation = (member: FamilyMember) => {
    // Hier könnte die Logik zum Senden einer Einladung implementiert werden
    alert(`Einladung an ${member.email} wurde erneut gesendet.`)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="people" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Personen & Familie</h1>
          <TabsList>
            <TabsTrigger value="people">Personen</TabsTrigger>
            <TabsTrigger value="family">Familienmitglieder</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="people" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Personen</h2>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Neue Person
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.people.map((person) => (
              <div key={person.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: person.color }} />
                  <span className="font-medium">{person.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditPerson(person)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeletePerson(person.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="family" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Familienmitglieder</h2>
            <Button onClick={() => setIsAddFamilyMemberDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Familienmitglied hinzufügen
            </Button>
          </div>

          {data.familyMembers.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-muted-foreground">
                Noch keine Familienmitglieder hinzugefügt. Füge Familienmitglieder hinzu, um deine Finanzdaten zu
                teilen.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {data.familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex flex-col">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {member.relation.charAt(0).toUpperCase() + member.relation.slice(1)} •
                      {member.canEdit ? " Kann bearbeiten" : " Nur Ansicht"} • Status:{" "}
                      {member.invitationStatus === "pending"
                        ? "Ausstehend"
                        : member.invitationStatus === "accepted"
                          ? "Akzeptiert"
                          : "Abgelehnt"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {member.invitationStatus === "pending" && (
                      <Button variant="outline" size="sm" onClick={() => handleSendInvitation(member)}>
                        <Mail className="h-4 w-4 mr-1" /> Erneut senden
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleEditFamilyMember(member)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteFamilyMember(member.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Person Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Neue Person hinzufügen</DialogTitle>
          </DialogHeader>
          <PersonForm onSuccess={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Person Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Person bearbeiten</DialogTitle>
          </DialogHeader>
          {currentPerson && <PersonForm person={currentPerson} onSuccess={() => setIsEditDialogOpen(false)} />}
        </DialogContent>
      </Dialog>

      {/* Add Family Member Dialog */}
      <Dialog open={isAddFamilyMemberDialogOpen} onOpenChange={setIsAddFamilyMemberDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Familienmitglied hinzufügen</DialogTitle>
          </DialogHeader>
          <FamilyMemberForm onSuccess={() => setIsAddFamilyMemberDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Family Member Dialog */}
      <Dialog open={isEditFamilyMemberDialogOpen} onOpenChange={setIsEditFamilyMemberDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Familienmitglied bearbeiten</DialogTitle>
          </DialogHeader>
          {currentFamilyMember && (
            <FamilyMemberForm member={currentFamilyMember} onSuccess={() => setIsEditFamilyMemberDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
