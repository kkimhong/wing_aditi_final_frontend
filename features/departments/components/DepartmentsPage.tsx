"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DepartmentForm } from "./DepartmentForm"
import { DepartmentTable } from "./DepartmentTable"
import type { DepartmentRequest } from "../schema/departmentSchema"
import {
  useCreateDepartment,
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

export function DepartmentsPage() {
  const { data: fetchedDepartments, isLoading, error } = useDepartment()
  const createDepartmentMutation = useCreateDepartment()
  const updateDepartmentMutation = useUpdateDepartment()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(
    null
  )
  const [searchQuery, setSearchQuery] = useState("")

  const departments = fetchedDepartments ?? []

  const editingDepartment =
    departments.find((department) => department.id === editingDepartmentId) ?? null

  const filteredDepartments = useMemo(() => {
    return departments.filter((department) =>
      department.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
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

  const saveErrorMessage =
    (createDepartmentMutation.error as Error | null)?.message ??
    (updateDepartmentMutation.error as Error | null)?.message ??
    null

  const handleSaveDepartment = async (data: DepartmentRequest) => {
    const normalizedBudget =
      typeof data.budgetLimit === "number" && !Number.isNaN(data.budgetLimit)
        ? data.budgetLimit
        : null

    const payload: DepartmentRequest = {
      name: data.name,
      budgetLimit: normalizedBudget,
    }

    createDepartmentMutation.reset()
    updateDepartmentMutation.reset()

    try {
      if (editingDepartmentId) {
        await updateDepartmentMutation.mutateAsync({
          id: editingDepartmentId,
          payload,
        })
      } else {
        await createDepartmentMutation.mutateAsync(payload)
      }

      setDialogOpen(false)
      setEditingDepartmentId(null)
    } catch {
      // Mutation errors are surfaced from react-query state
    }
  }

  return (
    <DashboardLayout
      title="Departments"
      actions={
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => {
            setEditingDepartmentId(null)
            createDepartmentMutation.reset()
            updateDepartmentMutation.reset()
            setDialogOpen(true)
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Department
        </Button>
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

      {saveErrorMessage ? (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {saveErrorMessage}
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
        onEdit={(department) => {
          setEditingDepartmentId(department.id)
          createDepartmentMutation.reset()
          updateDepartmentMutation.reset()
          setDialogOpen(true)
        }}
        emptyMessage="No departments match your search."
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditingDepartmentId(null)
            createDepartmentMutation.reset()
            updateDepartmentMutation.reset()
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
