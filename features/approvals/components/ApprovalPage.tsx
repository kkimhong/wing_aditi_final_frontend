"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AccessDenied } from "@/components/access-denied"
import { ExpenseTable } from "@/features/expenses/components/ExpenseTable"
import { ApprovalFilters, type ApprovalFiltersState } from "./ApprovalFilters"
import { ApprovalSummaryCards } from "./ApprovalSummaryCards"
import { RejectApprovalDialog } from "./RejectApprovalDialog"
import { ApprovalExpenseDetailsDialog } from "./ApprovalExpenseDetailsDialog"
import type {
  ApprovalExpense,
  RejectApprovalRequest,
} from "../schema/approvalSchema"
import { useAuthStore } from "@/store/authStore"
import {
  canAccessApprovalWorkspace,
  canApproveExpense,
  canManageAllApprovals,
} from "../lib/approvalAccess"
import { ACCESS_RULES, hasAnyPermission } from "@/lib/rbac"
import {
  useApprovalExpenses,
  useApproveExpense,
  useRejectExpense,
} from "../hook/useApproval"

const initialFilters: ApprovalFiltersState = {
  search: "",
  status: "SUBMITTED",
  department: "ALL",
  category: "ALL",
}

export function ApprovalPage() {
  const { permissions, roleName, departmentName } = useAuthStore()
  const [filters, setFilters] = useState<ApprovalFiltersState>(initialFilters)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsExpenseId, setDetailsExpenseId] = useState<string | null>(null)

  const canViewPage = canAccessApprovalWorkspace(roleName, permissions)
  const canApprovePermission = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.approveExpense
  )
  const canRejectPermission = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.rejectExpense
  )

  const canManageAll = useMemo(
    () => canManageAllApprovals(roleName, permissions),
    [permissions, roleName]
  )

  const approverDepartment = departmentName ?? "Engineering"

  const { data: fetchedExpenses, isLoading, error } = useApprovalExpenses(
    canViewPage,
    canManageAll
  )
  const approveExpenseMutation = useApproveExpense()
  const rejectExpenseMutation = useRejectExpense()

  const expenses = fetchedExpenses ?? []
  const selectedExpense =
    expenses.find((expense) => expense.id === selectedExpenseId) ?? null
  const detailExpense =
    expenses.find((expense) => expense.id === detailsExpenseId) ?? null

  const mutationErrorMessage =
    (approveExpenseMutation.error as Error | null)?.message ??
    (rejectExpenseMutation.error as Error | null)?.message ??
    null

  const resetMutations = () => {
    approveExpenseMutation.reset()
    rejectExpenseMutation.reset()
  }

  const scopedExpenses = useMemo(() => {
    if (canManageAll) {
      return expenses
    }

    return expenses.filter(
      (expense) => expense.departmentName === approverDepartment
    )
  }, [approverDepartment, canManageAll, expenses])

  const departments = useMemo(() => {
    const values = new Set(
      scopedExpenses
        .map((expense) => expense.departmentName)
        .filter((department): department is string => Boolean(department))
    )

    return Array.from(values).sort()
  }, [scopedExpenses])

  const categories = useMemo(() => {
    const values = new Set(
      scopedExpenses
        .map((expense) => expense.category)
        .filter((category): category is string => Boolean(category))
    )

    return Array.from(values).sort()
  }, [scopedExpenses])

  const filteredExpenses = useMemo(() => {
    return scopedExpenses.filter((expense) => {
      const term = filters.search.trim().toLowerCase()
      const matchesSearch =
        term.length === 0 ||
        expense.title.toLowerCase().includes(term) ||
        expense.submittedBy.toLowerCase().includes(term) ||
        (expense.notes ?? "").toLowerCase().includes(term)

      const matchesStatus =
        filters.status === "ALL" || expense.status === filters.status

      const matchesDepartment =
        filters.department === "ALL" || expense.departmentName === filters.department

      const matchesCategory =
        filters.category === "ALL" || expense.category === filters.category

      return matchesSearch && matchesStatus && matchesDepartment && matchesCategory
    })
  }, [scopedExpenses, filters])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search.trim()) count += 1
    if (filters.status !== "ALL") count += 1
    if (filters.department !== "ALL") count += 1
    if (filters.category !== "ALL") count += 1
    return count
  }, [filters])

  const handleApprove = async (expense: ApprovalExpense) => {
    if (!canApprovePermission) {
      return
    }

    if (!canApproveExpense(expense, canManageAll, approverDepartment)) {
      return
    }

    resetMutations()

    try {
      await approveExpenseMutation.mutateAsync(expense.id)
    } catch {
      // Mutation errors are surfaced from react-query state
    }
  }

  const handleReject = async (data: RejectApprovalRequest) => {
    if (!canRejectPermission || !selectedExpenseId) return

    const currentExpense = expenses.find((expense) => expense.id === selectedExpenseId)
    if (
      !currentExpense ||
      !canApproveExpense(currentExpense, canManageAll, approverDepartment)
    ) {
      setRejectOpen(false)
      setSelectedExpenseId(null)
      return
    }

    resetMutations()

    try {
      await rejectExpenseMutation.mutateAsync({
        id: selectedExpenseId,
        payload: data,
      })

      setRejectOpen(false)
      setSelectedExpenseId(null)
    } catch {
      // Mutation errors are surfaced from react-query state
    }
  }

  if (!canViewPage) {
    return (
      <DashboardLayout title="Approvals">
        <AccessDenied description="You are not allowed to access the approval workspace." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Approvals">
      <section className="rounded-none border bg-gradient-to-r from-emerald-50 via-white to-amber-50 p-5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Approval workspace
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          Review submitted expenses and make quick decisions
        </h2>
      </section>

      <ApprovalSummaryCards expenses={scopedExpenses} />

      {isLoading && expenses.length === 0 ? (
        <div className="rounded-none border bg-card p-4 text-sm text-muted-foreground">
          Loading approvals...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load approvals: {error.message}
        </div>
      ) : null}

      {mutationErrorMessage ? (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {mutationErrorMessage}
        </div>
      ) : null}

      <div className="rounded-none border bg-card p-3 text-xs text-muted-foreground">
        {canManageAll
          ? "You are viewing company-wide approvals."
          : `You are viewing ${approverDepartment} approvals as a department manager.`}
      </div>

      <ApprovalFilters
        filters={filters}
        departments={departments}
        categories={categories}
        activeFilterCount={activeFilterCount}
        resultCount={filteredExpenses.length}
        onChange={(next) => setFilters((current) => ({ ...current, ...next }))}
        onClear={() => setFilters(initialFilters)}
      />

      <ExpenseTable
        expenses={filteredExpenses}
        showSubmitter
        showDepartment
        showApprover
        emptyMessage="No expenses match your approval filters."
        rowActions={(expense) => {
          const canApproveInScope = canApproveExpense(
            expense,
            canManageAll,
            approverDepartment
          )

          const actions: Array<{
            label: string
            action: string
            destructive?: boolean
          }> = [{ label: "View details", action: "view" }]

          if (expense.status === "SUBMITTED" && canApproveInScope && canApprovePermission) {
            actions.push({ label: "Approve", action: "approve" })
          }

          if (expense.status === "SUBMITTED" && canApproveInScope && canRejectPermission) {
            actions.push({ label: "Reject", action: "reject", destructive: true })
          }

          return actions
        }}
        onRowAction={(expense, action) => {
          if (action === "view") {
            setDetailsExpenseId(expense.id)
            setDetailsOpen(true)
            return
          }

          if (action === "approve") {
            void handleApprove(expense)
            return
          }

          if (action === "reject") {
            setSelectedExpenseId(expense.id)
            setRejectOpen(true)
          }
        }}
      />

      <RejectApprovalDialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open)
          if (!open) {
            setSelectedExpenseId(null)
          }
        }}
        onReject={handleReject}
        isLoading={rejectExpenseMutation.isPending}
      />

      <ApprovalExpenseDetailsDialog
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open)
          if (!open) {
            setDetailsExpenseId(null)
          }
        }}
        expense={detailExpense}
      />

      {selectedExpense && (
        <p className="text-xs text-muted-foreground">
          Rejecting: <span className="font-medium">{selectedExpense.title}</span>
        </p>
      )}
    </DashboardLayout>
  )
}
