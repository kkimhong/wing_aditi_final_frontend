"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AccessDenied } from "@/components/access-denied"
import { CategoryForm } from "./CategoryForm"
import { CategoryTable } from "./CategoryTable"
import { DeleteCategoryDialog } from "./DeleteCategoryDialog"
import type { CategoryRequest, CategoryResponse } from "../schema/categorySchema"
import {
  useCategory,
  useCreateCategory,
  useDeleteCategory,
  useToggleCategoryStatus,
  useUpdateCategory,
} from "../hook/useCategory"
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
import { useAuthStore } from "@/store/authStore"
import { ACCESS_RULES, hasAnyPermission } from "@/lib/rbac"

type CategoryStatusFilter = "ALL" | "ACTIVE" | "INACTIVE"

export function CategoriesPage() {
  const { permissions, roleName } = useAuthStore()
  const canViewPage = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.viewCategories
  )
  const canCreateCategory = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.createCategories
  )
  const canUpdateCategory = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.updateCategories
  )
  const canDeleteCategory = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.deleteCategories
  )

  const { data: fetchedCategories, isLoading, error } = useCategory(canViewPage)
  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()
  const toggleCategoryStatusMutation = useToggleCategoryStatus()
  const deleteCategoryMutation = useDeleteCategory()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<CategoryStatusFilter>("ALL")
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteCategory, setPendingDeleteCategory] =
    useState<CategoryResponse | null>(null)

  const categories = fetchedCategories ?? []

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

  const resetMutations = () => {
    createCategoryMutation.reset()
    updateCategoryMutation.reset()
    toggleCategoryStatusMutation.reset()
    deleteCategoryMutation.reset()
  }

  const mutationErrorMessage =
    (createCategoryMutation.error as Error | null)?.message ??
    (updateCategoryMutation.error as Error | null)?.message ??
    (toggleCategoryStatusMutation.error as Error | null)?.message ??
    (deleteCategoryMutation.error as Error | null)?.message ??
    null

  const handleSaveCategory = async (data: CategoryRequest) => {
    const normalizedDescription = data.description?.trim() || null
    const normalizedLimit =
      typeof data.limitPerSubmission === "number" &&
      !Number.isNaN(data.limitPerSubmission)
        ? data.limitPerSubmission
        : null

    const payload: CategoryRequest = {
      name: data.name,
      description: normalizedDescription,
      limitPerSubmission: normalizedLimit,
    }

    resetMutations()

    try {
      if (editingCategoryId) {
        if (!canUpdateCategory) {
          return
        }

        await updateCategoryMutation.mutateAsync({
          id: editingCategoryId,
          payload,
        })
      } else {
        if (!canCreateCategory) {
          return
        }

        await createCategoryMutation.mutateAsync(payload)
      }

      setDialogOpen(false)
      setEditingCategoryId(null)
    } catch {
      // Mutation errors are surfaced from react-query state
    }
  }

  const handleToggleStatus = async (target: CategoryResponse) => {
    if (!canUpdateCategory) {
      return
    }

    resetMutations()

    try {
      await toggleCategoryStatusMutation.mutateAsync({
        category: target,
        active: !target.active,
      })
    } catch {
      // Mutation errors are surfaced from react-query state
    }
  }

  const requestDeleteCategory = (category: CategoryResponse) => {
    if (!canDeleteCategory) {
      return
    }

    resetMutations()
    setPendingDeleteCategory(category)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDeleteCategory = async () => {
    if (!pendingDeleteCategory) {
      return
    }

    const categoryId = pendingDeleteCategory.id
    setDeletingCategoryId(categoryId)

    try {
      await deleteCategoryMutation.mutateAsync(categoryId)

      if (editingCategoryId === categoryId) {
        setDialogOpen(false)
        setEditingCategoryId(null)
      }

      setDeleteDialogOpen(false)
      setPendingDeleteCategory(null)
    } catch {
      // Mutation errors are surfaced from react-query state
    } finally {
      setDeletingCategoryId(null)
    }
  }

  if (!canViewPage) {
    return (
      <DashboardLayout title="Categories">
        <AccessDenied description="You are not allowed to view categories." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Categories"
      actions={
        canCreateCategory ? (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setEditingCategoryId(null)
              resetMutations()
              setDialogOpen(true)
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Category
          </Button>
        ) : null
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

      {isLoading && categories.length === 0 ? (
        <div className="rounded-none border bg-card p-4 text-sm text-muted-foreground">
          Loading categories...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load categories: {error.message}
        </div>
      ) : null}

      {mutationErrorMessage ? (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {mutationErrorMessage}
        </div>
      ) : null}

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
        deletingCategoryId={deletingCategoryId}
        onEdit={
          canUpdateCategory
            ? (category) => {
                setEditingCategoryId(category.id)
                resetMutations()
                setDialogOpen(true)
              }
            : undefined
        }
        onToggleStatus={canUpdateCategory ? handleToggleStatus : undefined}
        onDelete={canDeleteCategory ? requestDeleteCategory : undefined}
        emptyMessage="No categories match your filters."
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditingCategoryId(null)
            resetMutations()
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
            isLoading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
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

      <DeleteCategoryDialog
        open={deleteDialogOpen}
        category={pendingDeleteCategory}
        isDeleting={deleteCategoryMutation.isPending}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)

          if (!open && !deleteCategoryMutation.isPending) {
            setPendingDeleteCategory(null)
          }
        }}
        onConfirm={handleConfirmDeleteCategory}
      />
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
