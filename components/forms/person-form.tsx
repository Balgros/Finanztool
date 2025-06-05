"use client"

import type React from "react"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Person } from "@/types/finance"

interface PersonFormProps {
  person?: Person
  onSuccess: () => void
}

export function PersonForm({ person, onSuccess }: PersonFormProps) {
  const { addPerson, updatePerson } = useFinance()

  const [formData, setFormData] = useState({
    id: person?.id || "",
    name: person?.name || "",
    color: person?.color || "#808080",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (person) {
      updatePerson(formData as Person)
    } else {
      addPerson(formData)
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Farbe</Label>
        <div className="flex gap-2">
          <Input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-12 h-10 p-1"
            required
          />
          <Input
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="flex-1"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Abbrechen
        </Button>
        <Button type="submit">{person ? "Aktualisieren" : "Hinzufügen"}</Button>
      </div>
    </form>
  )
}
