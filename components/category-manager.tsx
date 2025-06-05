"use client"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { CategoryForm } from "@/components/forms/category-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Pencil, Trash } from "lucide-react"
import type { Category } from "@/types/finance"

export function CategoryManager() {
  const { data, deleteCategory } = useFinance()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [categoryType, setCategoryType] = useState<"expense" | "income">("expense")

  const expenseCategories = data.categories.filter((category) => category.type === "expense")

  const incomeCategories = data.categories.filter((category) => category.type === "income")

  const handleAddCategory = (type: "expense" | "income") => {
    setCategoryType(type)
    setIsAddDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category)
    setCategoryType(category.type)
    setIsEditDialogOpen(true)
  }

  const handleDeleteCategory = (id: string) => {
    if (window.confirm("Möchtest du diese Kategorie wirklich löschen?")) {
      deleteCategory(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Kategorien</h1>
      </div>

      <Tabs defaultValue="expense">
        <TabsList>
          <TabsTrigger value="expense">Ausgaben</TabsTrigger>
          <TabsTrigger value="income">Einnahmen</TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => handleAddCategory("expense")}>
              <Plus className="mr-2 h-4 w-4" /> Neue Kategorie
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => handleAddCategory("income")}>
              <Plus className="mr-2 h-4 w-4" /> Neue Kategorie
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {categoryType === "expense" ? "Neue Ausgabenkategorie" : "Neue Einnahmenkategorie"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm type={categoryType} onSuccess={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {categoryType === "expense" ? "Ausgabenkategorie bearbeiten" : "Einnahmenkategorie bearbeiten"}
            </DialogTitle>
          </DialogHeader>
          {currentCategory && (
            <CategoryForm category={currentCategory} type={categoryType} onSuccess={() => setIsEditDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
