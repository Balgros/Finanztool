"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useFinance } from "@/context/finance-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { sendEmail, emailTemplates, generateInvitationToken, storeInvitationToken } from "@/services/email-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, CheckCircle2 } from "lucide-react"
import type { FamilyMember } from "@/types/finance"

const formSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
  relation: z.enum(["spouse", "child", "parent", "sibling", "other"], {
    required_error: "Bitte wählen Sie eine Beziehung aus",
  }),
  canView: z.boolean().default(true),
  canEdit: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

interface FamilyMemberFormProps {
  member?: FamilyMember
  onSuccess: () => void
}

export function FamilyMemberForm({ member, onSuccess }: FamilyMemberFormProps) {
  const { addFamilyMember, updateFamilyMember, data } = useFinance()
  const { user, getAllUsers } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingUser, setExistingUser] = useState<{ id: string; name: string; email: string } | null>(null)
  const [existingFamilyMember, setExistingFamilyMember] = useState<FamilyMember | null>(null)

  const defaultValues: Partial<FormValues> = {
    name: member?.name || "",
    email: member?.email || "",
    relation: member?.relation || "other",
    canView: member?.canView ?? true,
    canEdit: member?.canEdit ?? false,
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Überprüfe, ob die E-Mail-Adresse bereits einem Benutzer oder Familienmitglied gehört
  const checkExistingUser = (email: string) => {
    // Prüfe, ob die E-Mail bereits einem Benutzer gehört
    const users = getAllUsers()
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (foundUser) {
      setExistingUser({
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
      })
    } else {
      setExistingUser(null)
    }

    // Prüfe, ob die E-Mail bereits einem Familienmitglied gehört
    const foundFamilyMember = data.familyMembers.find(
      (fm) => fm.email.toLowerCase() === email.toLowerCase() && fm.id !== member?.id,
    )

    if (foundFamilyMember) {
      setExistingFamilyMember(foundFamilyMember)
    } else {
      setExistingFamilyMember(null)
    }
  }

  // Überwache Änderungen an der E-Mail-Adresse
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "email" && value.email) {
        checkExistingUser(value.email)
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  // Überprüfe die E-Mail-Adresse beim Laden des Formulars
  useEffect(() => {
    if (member?.email) {
      checkExistingUser(member.email)
    }
  }, [member])

  const onSubmit = async (values: FormValues) => {
    // Wenn die E-Mail bereits einem Familienmitglied gehört, zeige einen Fehler an
    if (existingFamilyMember) {
      toast({
        title: "Fehler",
        description: `Diese E-Mail-Adresse wird bereits von einem anderen Familienmitglied (${existingFamilyMember.name}) verwendet.`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (member) {
        // Aktualisiere ein bestehendes Familienmitglied
        updateFamilyMember({
          ...member,
          ...values,
        })
        toast({
          title: "Familienmitglied aktualisiert",
          description: `${values.name} wurde erfolgreich aktualisiert.`,
        })
        onSuccess()
      } else {
        // Wenn der Benutzer bereits existiert, füge ihn direkt als Familienmitglied hinzu
        if (existingUser) {
          const newMember = {
            ...values,
            id: "", // wird in addFamilyMember generiert
            invitationStatus: "accepted", // Direkt als akzeptiert markieren
            invitationDate: new Date().toISOString(),
            invitationToken: "", // Kein Token erforderlich
          }

          addFamilyMember(newMember)

          toast({
            title: "Familienmitglied hinzugefügt",
            description: `${values.name} wurde als Familienmitglied hinzugefügt.`,
          })
          onSuccess()
        } else {
          // Generiere einen Einladungstoken für neue Benutzer
          const token = generateInvitationToken()

          // Speichere den Token
          storeInvitationToken(values.email, token)

          // Füge ein neues Familienmitglied hinzu
          const newMember = {
            ...values,
            id: "", // wird in addFamilyMember generiert
            invitationStatus: "pending",
            invitationDate: new Date().toISOString(),
            invitationToken: token, // Speichere den Token auch im Familienmitglied
          }

          addFamilyMember(newMember)

          // Sende eine Einladungs-E-Mail
          const appUrl = window.location.origin
          const emailTemplate = emailTemplates.familyMemberInvitation(
            user?.name || "Ein Benutzer",
            values.email,
            values.relation,
            appUrl,
            token,
          )

          await sendEmail({
            to: values.email,
            subject: emailTemplate.subject,
            body: emailTemplate.body,
          })

          toast({
            title: "Familienmitglied hinzugefügt",
            description: `${values.name} wurde hinzugefügt und eine Einladung wurde per E-Mail gesendet.`,
          })
          onSuccess()
        }
      }
    } catch (error) {
      console.error("Fehler beim Speichern des Familienmitglieds:", error)
      toast({
        title: "Fehler",
        description: "Es ist ein Fehler aufgetreten. Bitte versuche es erneut.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {existingFamilyMember && (
          <Alert variant="destructive">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Bereits vorhanden</AlertTitle>
            <AlertDescription>
              Diese E-Mail-Adresse wird bereits von einem anderen Familienmitglied ({existingFamilyMember.name})
              verwendet. Bitte verwende eine andere E-Mail-Adresse.
            </AlertDescription>
          </Alert>
        )}

        {existingUser && !existingFamilyMember && !member && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Benutzer gefunden</AlertTitle>
            <AlertDescription>
              Ein Benutzer mit dieser E-Mail-Adresse existiert bereits. {existingUser.name} wird direkt als
              Familienmitglied hinzugefügt, ohne eine Einladung zu senden.
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Name des Familienmitglieds"
                  {...field}
                  value={existingUser && !member ? existingUser.name : field.value}
                  disabled={!!existingUser && !member}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail</FormLabel>
              <FormControl>
                <Input
                  placeholder="E-Mail-Adresse"
                  type="email"
                  {...field}
                  disabled={!!member} // Deaktiviere das Feld, wenn ein Mitglied bearbeitet wird
                />
              </FormControl>
              <FormDescription>
                {!existingUser && !member
                  ? "Eine Einladung wird an diese E-Mail-Adresse gesendet."
                  : "Die E-Mail-Adresse kann nicht geändert werden."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="relation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beziehung</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Beziehung auswählen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="spouse">Partner/in</SelectItem>
                  <SelectItem value="child">Kind</SelectItem>
                  <SelectItem value="parent">Elternteil</SelectItem>
                  <SelectItem value="sibling">Geschwister</SelectItem>
                  <SelectItem value="other">Andere</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="canView"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Ansehen erlauben</FormLabel>
                <FormDescription>Erlaubt dem Familienmitglied, Ihre Finanzdaten einzusehen.</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="canEdit"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={!form.watch("canView")} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Bearbeiten erlauben</FormLabel>
                <FormDescription>Erlaubt dem Familienmitglied, Ihre Finanzdaten zu bearbeiten.</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isSubmitting || !!existingFamilyMember}>
            {isSubmitting
              ? "Wird gespeichert..."
              : member
                ? "Aktualisieren"
                : existingUser
                  ? "Direkt hinzufügen"
                  : "Hinzufügen & Einladen"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
