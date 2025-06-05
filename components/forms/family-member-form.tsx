"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import type { FamilyMember } from "@/types/finance"

interface FamilyMemberFormProps {
  member?: FamilyMember
  onSuccess: () => void
}

export function FamilyMemberForm({ member, onSuccess }: FamilyMemberFormProps) {
  const [name, setName] = useState(member?.name || "")
  const [email, setEmail] = useState(member?.email || "")
  const [relation, setRelation] = useState(member?.relation || "other")
  const [canView, setCanView] = useState(member?.canView ?? true)
  const [canEdit, setCanEdit] = useState(member?.canEdit ?? false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simuliere eine Verzögerung
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Funktion deaktiviert",
        description: "Diese Funktion ist vorübergehend deaktiviert. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      })
    } catch (error) {
      console.error("Fehler:", error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Hinweis</AlertTitle>
        <AlertDescription>
          Diese Funktion ist vorübergehend deaktiviert. Bitte versuchen Sie es später erneut.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name des Familienmitglieds"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-Mail-Adresse"
          required
          disabled={!!member}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="relation">Beziehung</Label>
        <Select value={relation} onValueChange={(value) => setRelation(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Beziehung auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="spouse">Partner/in</SelectItem>
            <SelectItem value="child">Kind</SelectItem>
            <SelectItem value="parent">Elternteil</SelectItem>
            <SelectItem value="sibling">Geschwister</SelectItem>
            <SelectItem value="other">Andere</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="canView" checked={canView} onCheckedChange={(checked) => setCanView(!!checked)} />
        <Label htmlFor="canView">Ansehen erlauben</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="canEdit"
          checked={canEdit}
          onCheckedChange={(checked) => setCanEdit(!!checked)}
          disabled={!canView}
        />
        <Label htmlFor="canEdit">Bearbeiten erlauben</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Wird gespeichert..." : member ? "Aktualisieren" : "Hinzufügen"}
        </Button>
      </div>
    </form>
  )
}
