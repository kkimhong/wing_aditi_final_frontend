"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AccessDenied } from "@/components/access-denied"
import { DepartmentForm } from "./DepartmentForm"
import { DepartmentTable } from "./DepartmentTable"
import { DeleteDepartmentDialog } from "./DeleteDepartmentDialog"
import type { DepartmentRequest, DepartmentResponse } from "../schema/departmentSchema"
import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartment,
  useUpdateDepartment,
} from "../hook/useDepartment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { ACCESS_RULES, hasAnyPermission } from "@/lib/rbac"

export function DepartmentsPage() {
  const { permissions, roleName } = useAuthStore()
  const canViewPage = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.viewDepartments
  )
  const canCreateDepartment = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.createDepartments
  )
  const canUpdateDepartment = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.updateDepartments
  )
  const canDeleteDepartment = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.deleteDepartments
  )

  const { data: fetchedDepartments, isLoading, error } = useDepartment(canViewPage)
  const createDepartmentMutation = useCreateDepartment()
  const updateDepartmentMutation = useUpdateDepartment()
  const deleteDepartmentMutation = useDeleteDepartment()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(
    null
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<string | null>(
    null
  )
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteDepartment, setPendingDeleteDepartment] =
    useState<DepartmentResponse | null>(null)

  const departments = fetchedDepartments ?? []

  const editingDepartment =
    departments.find((department) => department.id === editingDepartmentId) ?? null

  const filteredDepartments = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()

    if (!term) {
      return departments
    }

    return departments.filter((department) =>
      department.name.toLowerCase().includes(term)
    )
  }, [departments, searchQuery])

  const totalUsers = departments.reduce(
    (sum, department) => sum + department.userCount,
    0
  )
  const totalBudget = departments.reduce(
    (sum, department) => sum + (department.budgetLimit ?? 0),
    0
  )

  const isSaving =
    createDepartmentMutation.isPending || updateDepartmentMutation.isPending

  const mutationErrorMessage =
    (createDepartmentMutation.error as Error | null)?.message ??
    (updateDepartmentMutation.error as Error | null)?.message ??
    (deleteDepartmentMutation.error as Error | null)?.message ??
    null

  const resetMutations = () => {
    createDepartmentMutation.reset()
    updateDepartmentMutation.reset()
    deleteDepartmentMutation.reset()
  }

  const handleSaveDepartment = async (data: DepartmentRequest) => {
    const normalizedBudget =
      typeof data.budgetLimit === "number" && !Number.isNaN(data.budgetLimit)
        ? data.budgetLimit
        : null

    const payload: DepartmentRequest = {
      name: data.name,
      budgetLimit: normalizedBudget,
    }

    resetMutations()

    try {
      if (editingDepartmentId) {
        if (!canUpdateDepartment) {
          return
        }

        await updateDepartmentMutation.mutateAsync({
          id: editingDepartmentId,
          payload,
        })
      } else {
        if (!canCreateDepartment) {
          return
        }

        await createDepartmentMutation.mutateAsync(payload)
      }

      setDialogOpen(false)
      setEditingDepartmentId(null)
    } catch {
      // Mutation errors are surfaced from react-query state
    }
  }

  const requestDeleteDepartment = (department: DepartmentResponse) => {
    if (!canDeleteDepartment) {
      return
    }

    resetMutations()
    setPendingDeleteDepartment(department)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDeleteDepartment = async () => {
    if (!pendingDeleteDepartment) {
      return
    }

    const departmentId = pendingDeleteDepartment.id

    setDeletingDepartmentId(departmentId)

    try {
      await deleteDepartmentMutation.mutateAsync(departmentId)

      if (editingDepartmentId === departmentId) {
        setDialogOpen(false)
        setEditingDepartmentId(null)
      }

      setDeleteDialogOpen(false)
      setPendingDeleteDepartment(null)
    } catch {
      // Mutation errors are surfaced from react-query state
    } finally {
      setDeletingDepartmentId(null)
    }
  }

  if (!canViewPage) {
    return (
      <DashboardLayout title="Departments">
        <AccessDenied description="You are not allowed to view departments." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Departments"
      actions={
        canCreateDepartment ? (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setEditingDepartmentId(null)
              resetMutations()
              setDialogOpen(true)
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Department
          </Button>
        ) : null
      }
    >
      <section className="rounded-none border bg-gradient-to-r from-emerald-50 via-white to-lime-50 p-5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Department setup
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          Manage budgets and organizational structure
        </h2>
      </section>

      {isLoading && departments.length === 0 ? (
        <div className="rounded-none border bg-card p-4 text-sm text-muted-foreground">
          Loading departments...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load departments: {error.message}
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
            <CardTitle className="text-xs text-muted-foreground">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{departments.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-none stats-card">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalUsers}</p>
          </CardContent>
        </Card>

        <Card className="rounded-none stats-card">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(totalBudget)}</p>
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-3 rounded-none border bg-card p-4 md:flex-row md:items-end">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by department name"
            className="pl-8"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <p className="text-xs text-muted-foreground md:ml-auto">
          {filteredDepartments.length} department
          {filteredDepartments.length === 1 ? "" : "s"}
        </p>
      </section>

      <DepartmentTable
        departments={filteredDepartments}
        deletingDepartmentId={deletingDepartmentId}
        onEdit={
          canUpdateDepartment
            ? (department) => {
                setEditingDepartmentId(department.id)
                resetMutations()
                setDialogOpen(true)
              }
            : undefined
        }
        onDelete={canDeleteDepartment ? requestDeleteDepartment : undefined}
        emptyMessage="No departments match your search."
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditingDepartmentId(null)
            resetMutations()
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? "Edit department" : "Create department"}
            </DialogTitle>
            <DialogDescription>
              {editingDepartment
                ? "Update department information and budget."
                : "Create a department for role and budget assignments."}
            </DialogDescription>
          </DialogHeader>

          <DepartmentForm
            key={editingDepartment?.id ?? "new"}
            onSubmit={handleSaveDepartment}
            isLoading={isSaving}
            defaultValues={
              editingDepartment
                ? {
                    name: editingDepartment.name,
                    budgetLimit: editingDepartment.budgetLimit,
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>

      <DeleteDepartmentDialog
        open={deleteDialogOpen}
        department={pendingDeleteDepartment}
        isDeleting={deleteDepartmentMutation.isPending}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)

          if (!open && !deleteDepartmentMutation.isPending) {
            setPendingDeleteDepartment(null)
          }
        }}
        onConfirm={handleConfirmDeleteDepartment}
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
