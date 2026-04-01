"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AccessDenied } from "@/components/access-denied"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ExpenseSummaryCards } from "./ExpenseSummaryCards"
import { ExpenseTable } from "./ExpenseTable"
import { ExpenseCreateSheet } from "./ExpenseCreateSheet"
import { ExpenseDetailsDialog } from "./ExpenseDetailsDialog"
import type { CreateExpenseRequest } from "../types/expenseTypes"
import type { ExpenseStatus } from "@/types/common"
import { Plus, Search } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { ACCESS_RULES, hasAnyPermission } from "@/lib/rbac"
import {
  useCreateExpense,
  useDeleteExpense,
  useMyExpenses,
  useSubmitExpense,
  useUpdateExpense,
} from "../hook/useExpense"
import { useCategory } from "@/features/categories/hook/useCategory"

const statusFilterItems: Array<{ label: string; value: "ALL" | ExpenseStatus }> = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
]

export function MyExpensesPage() {
  const { permissions, roleName } = useAuthStore()
  const canViewPage = hasAnyPermission(roleName, permissions, ACCESS_RULES.viewMyExpenses)
  const canCreateExpense = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.createExpense
  )
  const canSubmitExpense = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.submitExpense
  )

  const [sheetOpen, setSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | ExpenseStatus>("ALL")
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsExpenseId, setDetailsExpenseId] = useState<string | null>(null)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)

  const { data: fetchedExpenses, isLoading, error } = useMyExpenses(canViewPage)
  const { data: fetchedCategories } = useCategory(canCreateExpense)
  const createExpenseMutation = useCreateExpense()
  const updateExpenseMutation = useUpdateExpense()
  const submitExpenseMutation = useSubmitExpense()
  const deleteExpenseMutation = useDeleteExpense()

  const expenses = fetchedExpenses ?? []
  const categoryOptions = useMemo(() => {
    const categories = fetchedCategories ?? []

    return categories
      .filter((category) => category.active)
      .map((category) => ({
        id: category.id,
        name: category.name,
        limitPerSubmission: category.limitPerSubmission,
      }))
  }, [fetchedCategories])

  const detailExpense =
    expenses.find((expense) => expense.id === detailsExpenseId) ?? null
  const editingExpense =
    expenses.find((expense) => expense.id === editingExpenseId) ?? null

  const mutationErrorMessage =
    (createExpenseMutation.error as Error | null)?.message ??
    (updateExpenseMutation.error as Error | null)?.message ??
    (submitExpenseMutation.error as Error | null)?.message ??
    (deleteExpenseMutation.error as Error | null)?.message ??
    null

  const resetMutations = () => {
    createExpenseMutation.reset()
    updateExpenseMutation.reset()
    submitExpenseMutation.reset()
    deleteExpenseMutation.reset()
  }

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const searchValue = searchQuery.trim().toLowerCase()
      const matchesSearch =
        searchValue.length === 0 ||
        expense.title.toLowerCase().includes(searchValue) ||
        (expense.category ?? "").toLowerCase().includes(searchValue)
      const matchesStatus = statusFilter === "ALL" || expense.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [expenses, searchQuery, statusFilter])

  const handleCreateExpense = async (
    values: CreateExpenseRequest,
    submitForApproval = false
  ) => {
    if (!canCreateExpense) {
      return
    }

    if (submitForApproval && !canSubmitExpense) {
      return
    }

    resetMutations()

    try {
      if (editingExpenseId) {
        await updateExpenseMutation.mutateAsync({
          id: editingExpenseId,
          payload: values,
        })

        if (submitForApproval) {
          await submitExpenseMutation.mutateAsync(editingExpenseId)
        }
      } else {
        const createdExpenseId = await createExpenseMutation.mutateAsync(values)

        if (submitForApproval) {
          if (!createdExpenseId) {
            throw new Error(
              "Expense was created but could not be auto-submitted. Please submit from the table."
            )
          }

          await submitExpenseMutation.mutateAsync(createdExpenseId)
        }
      }

      setSheetOpen(false)
      setEditingExpenseId(null)
    } catch {
      // Mutation errors are surfaced from react-query state
    }
  }

  const handleExpenseAction = async (expenseId: string, action: string) => {
    resetMutations()

    if (action === "delete") {
      if (!canCreateExpense) {
        return
      }

      try {
        await deleteExpenseMutation.mutateAsync(expenseId)
      } catch {
        // Mutation errors are surfaced from react-query state
      }

      return
    }

    if (action === "submit") {
      if (!canSubmitExpense) {
        return
      }

      try {
        await submitExpenseMutation.mutateAsync(expenseId)
      } catch {
        // Mutation errors are surfaced from react-query state
      }
    }
  }

  if (!canViewPage) {
    return (
      <DashboardLayout title="My Expenses">
        <AccessDenied description="You are not allowed to view the expense workspace." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="My Expenses"
      actions={
        canCreateExpense ? (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              resetMutations()
              setEditingExpenseId(null)
              setSheetOpen(true)
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            New Expense
          </Button>
        ) : null
      }
    >
      <ExpenseSummaryCards expenses={expenses} />

      {isLoading && expenses.length === 0 ? (
        <div className="rounded-none border bg-card p-4 text-sm text-muted-foreground">
          Loading expenses...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load expenses: {error.message}
        </div>
      ) : null}

      {mutationErrorMessage ? (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {mutationErrorMessage}
        </div>
      ) : null}

      <section className="flex flex-col gap-3 rounded-none border bg-card p-4 md:flex-row md:items-end">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title or category"
            className="pl-8"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="w-full md:w-[180px]">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as "ALL" | ExpenseStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusFilterItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground md:ml-auto">
          {filteredExpenses.length} result{filteredExpenses.length === 1 ? "" : "s"}
        </p>
      </section>

      <ExpenseTable
        expenses={filteredExpenses}
        showApprover
        rowActions={(expense) => {
          const actions: Array<{
            label: string
            action: string
            destructive?: boolean
          }> = [{ label: "View details", action: "view" }]

          if (
            (expense.status === "DRAFT" || expense.status === "REJECTED") &&
            canSubmitExpense
          ) {
            actions.push({
              label: expense.status === "REJECTED" ? "Resubmit" : "Submit",
              action: "submit",
            })
          }

          if (
            (expense.status === "DRAFT" || expense.status === "REJECTED") &&
            canCreateExpense
          ) {
            actions.push({ label: "Edit", action: "edit" })
          }

          if (expense.status === "DRAFT" && canCreateExpense) {
            actions.push({ label: "Delete", action: "delete", destructive: true })
          }

          return actions
        }}
        onRowAction={(expense, action) => {
          if (action === "view") {
            setDetailsExpenseId(expense.id)
            setDetailsOpen(true)
            return
          }

          if (action === "edit") {
            resetMutations()
            setEditingExpenseId(expense.id)
            setSheetOpen(true)
            return
          }

          void handleExpenseAction(expense.id, action)
        }}
        emptyMessage="No expenses match your current filters."
      />

      {canCreateExpense ? (
        <ExpenseCreateSheet
          open={sheetOpen}
          onOpenChange={(open) => {
            setSheetOpen(open)

            if (!open) {
              setEditingExpenseId(null)
            }
          }}
          onCreate={handleCreateExpense}
          defaultValues={
            editingExpense
              ? {
                  title: editingExpense.title,
                  amount: editingExpense.amount,
                  currency: editingExpense.currency,
                  categoryId: editingExpense.categoryId ?? undefined,
                  expenseDate: editingExpense.expenseDate,
                  notes: editingExpense.notes ?? "",
                  receiptUrl: editingExpense.receiptUrl ?? "",
                }
              : undefined
          }
          categories={categoryOptions}
          allowSubmit={canSubmitExpense}
          isLoading={
            createExpenseMutation.isPending ||
            updateExpenseMutation.isPending ||
            submitExpenseMutation.isPending
          }
        />
      ) : null}

      <ExpenseDetailsDialog
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open)
          if (!open) {
            setDetailsExpenseId(null)
          }
        }}
        expense={detailExpense}
      />
    </DashboardLayout>
  )
}
