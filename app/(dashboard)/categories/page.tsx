"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CategoryForm } from "@/features/categories/components/CategoryForm"
import { CategoryTable } from "@/features/categories/components/CategoryTable"
import type { CategoryResponse, CategoryRequest } from "@/features/categories/types/categoryTypes"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

// Mock data — replace with API calls
const mockCategories: CategoryResponse[] = []

export default function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = (data: CategoryRequest) => {
    console.log("Create category:", data)
    setDialogOpen(false)
  }

  return (
    <DashboardLayout
      title="Categories"
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Category</DialogTitle>
              <DialogDescription>
                Create a new expense category.
              </DialogDescription>
            </DialogHeader>
            <CategoryForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      }
    >
      <CategoryTable categories={mockCategories} />
    </DashboardLayout>
  )
}
