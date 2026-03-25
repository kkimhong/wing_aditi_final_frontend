"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CategoryForm } from "./CategoryForm"
import { CategoryTable } from "./CategoryTable"
import { mockCategories } from "./categoryMockData"
import type { CategoryRequest, CategoryResponse } from "../schema/categorySchema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search } from "lucide-react"

type CategoryStatusFilter = "ALL" | "ACTIVE" | "INACTIVE"

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>(mockCategories)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<CategoryStatusFilter>("ALL")

  const editingCategory =
    categories.find((category) => category.id === editingCategoryId) ?? null

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const term = searchQuery.trim().toLowerCase()
      const matchesSearch =
        term.length === 0 ||
        category.name.toLowerCase().includes(term) ||
        (category.description ?? "").toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" ? category.active : !category.active)

      return matchesSearch && matchesStatus
    })
  }, [categories, searchQuery, statusFilter])

  const totalActive = categories.filter((category) => category.active).length
  const categoriesWithLimit = categories.filter(
    (category) => category.limitPerSubmission != null
  )
  const averageLimit =
    categoriesWithLimit.length > 0
      ? categoriesWithLimit.reduce(
          (sum, category) => sum + (category.limitPerSubmission ?? 0),
          0
        ) / categoriesWithLimit.length
      : 0

  const handleSaveCategory = (data: CategoryRequest) => {
    const normalizedDescription = data.description?.trim() || null
    const normalizedLimit =
      typeof data.limitPerSubmission === "number" &&
      !Number.isNaN(data.limitPerSubmission)
        ? data.limitPerSubmission
        : null

    if (editingCategoryId) {
      setCategories((current) =>
        current.map((category) =>
          category.id === editingCategoryId
            ? {
                ...category,
                name: data.name,
                description: normalizedDescription,
                limitPerSubmission: normalizedLimit,
              }
            : category
        )
      )
    } else {
      const nextCategory: CategoryResponse = {
        id: createId(),
        name: data.name,
        description: normalizedDescription,
        limitPerSubmission: normalizedLimit,
        active: true,
        createdAt: new Date().toISOString(),
      }

      setCategories((current) => [nextCategory, ...current])
    }

    setDialogOpen(false)
    setEditingCategoryId(null)
  }

  const handleToggleStatus = (target: CategoryResponse) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === target.id
          ? { ...category, active: !category.active }
          : category
      )
    )
  }

  return (
    <DashboardLayout
      title="Categories"
      actions={
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => {
            setEditingCategoryId(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Category
        </Button>
      }
    >
      <section className="rounded-none border bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Category governance
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          Define spend categories and control submission limits
        </h2>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="rounded-none stats-card">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{categories.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-none stats-card">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">Active Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalActive}</p>
          </CardContent>
        </Card>

        <Card className="rounded-none stats-card">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">Average Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(averageLimit)}</p>
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-3 rounded-none border bg-card p-4 md:flex-row md:items-end">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories"
            className="pl-8"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="w-full md:w-[180px]">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as CategoryStatusFilter)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground md:ml-auto">
          {filteredCategories.length} categor{filteredCategories.length === 1 ? "y" : "ies"}
        </p>
      </section>

      <CategoryTable
        categories={filteredCategories}
        onEdit={(category) => {
          setEditingCategoryId(category.id)
          setDialogOpen(true)
        }}
        onToggleStatus={handleToggleStatus}
        emptyMessage="No categories match your filters."
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditingCategoryId(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit category" : "Create category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category details and limits."
                : "Create a new category for expense submissions."}
            </DialogDescription>
          </DialogHeader>

          <CategoryForm
            onSubmit={handleSaveCategory}
            defaultValues={
              editingCategory
                ? {
                    name: editingCategory.name,
                    description: editingCategory.description,
                    limitPerSubmission: editingCategory.limitPerSubmission,
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}


