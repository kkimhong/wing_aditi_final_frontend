"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AccessDenied } from "@/components/access-denied"
import { ExpenseTable } from "@/features/expenses/components/ExpenseTable"
import { ReportsSummaryCards } from "./ReportsSummaryCards"
import { ReportsFilters } from "./ReportsFilters"
import type { ReportExpense, ReportFilters } from "../schema/reportSchema"
import { useAuthStore } from "@/store/authStore"
import { ACCESS_RULES, hasAnyPermission } from "@/lib/rbac"
import { useMyExpenses } from "@/features/expenses/hook/useExpense"
import {
  useAllExpenses,
  useApprovalExpenses,
  useDepartmentExpenses,
} from "@/features/approvals/hook/useApproval"
import { canManageAllApprovals } from "@/features/approvals/lib/approvalAccess"

const initialFilters: ReportFilters = {
  status: "ALL",
  department: "ALL",
  startDate: "",
  endDate: "",
  month: getCurrentMonth(),
  exportMode: "MONTHLY",
}

export function ReportsPage() {
  const { permissions, roleName, expenseScope } = useAuthStore()
  const canViewPage = hasAnyPermission(roleName, permissions, ACCESS_RULES.viewReports)
  const canExport = hasAnyPermission(roleName, permissions, ACCESS_RULES.exportReports)
  const canViewAllExpenses = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.viewAllExpenses
  )
  const canViewApprovalScope = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.viewApprovals
  )
  const canViewMyExpenses = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.viewMyExpenses
  )

  const [filters, setFilters] = useState<ReportFilters>(initialFilters)

  const canManageAll = useMemo(
    () => canManageAllApprovals(roleName, permissions, expenseScope),
    [permissions, roleName, expenseScope]
  )

  const {
    data: allExpensesRaw = [],
    isLoading: isLoadingAllExpensesRaw,
    error: allExpensesErrorRaw,
  } = useAllExpenses(canViewPage && canViewAllExpenses && canManageAll)
  const {
    data: departmentExpenses = [],
    isLoading: isLoadingDepartmentExpenses,
    error: departmentExpensesError,
  } = useDepartmentExpenses(canViewPage && canViewAllExpenses && !canManageAll)
  const {
    data: approvalExpenses = [],
    isLoading: isLoadingApprovalExpenses,
    error: approvalExpensesError,
  } = useApprovalExpenses(
    canViewPage && !canViewAllExpenses && canViewApprovalScope,
    canManageAll
  )
  const {
    data: myExpenses = [],
    isLoading: isLoadingMyExpenses,
    error: myExpensesError,
  } = useMyExpenses(
    canViewPage && !canViewAllExpenses && !canViewApprovalScope && canViewMyExpenses
  )

  const allExpenses = canManageAll ? allExpensesRaw : departmentExpenses
  const isLoadingAllExpenses = canManageAll
    ? isLoadingAllExpensesRaw
    : isLoadingDepartmentExpenses
  const allExpensesError = canManageAll ? allExpensesErrorRaw : departmentExpensesError

  const sourceExpenses: ReportExpense[] = canViewAllExpenses
    ? allExpenses
    : canViewApprovalScope
      ? approvalExpenses
      : myExpenses

  const hasDataScopePermission =
    canViewAllExpenses || canViewApprovalScope || canViewMyExpenses

  const sourceLabel = canViewAllExpenses
    ? canManageAll
      ? "Company-wide expenses"
      : "Department expenses"
    : canViewApprovalScope
      ? canManageAll
        ? "Approval scope: all departments"
        : "Approval scope: your department"
      : "Personal expenses"

  const isLoadingData = canViewAllExpenses
    ? isLoadingAllExpenses
    : canViewApprovalScope
      ? isLoadingApprovalExpenses
      : isLoadingMyExpenses

  const dataError = canViewAllExpenses
    ? allExpensesError
    : canViewApprovalScope
      ? approvalExpensesError
      : myExpensesError

  const departments = useMemo(() => {
    const values = new Set(
      sourceExpenses
        .map((expense) => expense.departmentName)
        .filter((department): department is string => Boolean(department))
    )

    return Array.from(values).sort()
  }, [sourceExpenses])

  const filteredExpenses = useMemo(() => {
    return sourceExpenses.filter((expense) => {
      const matchesStatus = filters.status === "ALL" || expense.status === filters.status
      const matchesDepartment =
        filters.department === "ALL" || expense.departmentName === filters.department
      const matchesStartDate = !filters.startDate || expense.expenseDate >= filters.startDate
      const matchesEndDate = !filters.endDate || expense.expenseDate <= filters.endDate

      return matchesStatus && matchesDepartment && matchesStartDate && matchesEndDate
    })
  }, [filters, sourceExpenses])

  const monthlyExpenses = useMemo(() => {
    if (!filters.month) return sourceExpenses

    return sourceExpenses.filter((expense) => expense.expenseDate.startsWith(filters.month))
  }, [filters.month, sourceExpenses])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.status !== "ALL") count += 1
    if (filters.department !== "ALL") count += 1
    if (filters.startDate) count += 1
    if (filters.endDate) count += 1
    return count
  }, [filters])

  const handleExport = () => {
    if (!canExport) {
      return
    }

    const exportRows =
      filters.exportMode === "MONTHLY" ? monthlyExpenses : filteredExpenses

    if (exportRows.length === 0) {
      return
    }

    const fileName =
      filters.exportMode === "MONTHLY"
        ? `expenses-${filters.month || "monthly"}.csv`
        : `expenses-${filters.startDate || "start"}-to-${filters.endDate || "end"}.csv`

    const csv = toCsv(exportRows)
    downloadCsv(csv, fileName)
  }

  if (!canViewPage) {
    return (
      <DashboardLayout title="Reports">
        <AccessDenied description="You are not allowed to view reports." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Reports">
      <section className="rounded-none border bg-gradient-to-r from-cyan-50 via-white to-sky-50 p-5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Reporting center
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          Export monthly expenses or filtered duration reports from live data
        </h2>
      </section>

      {!hasDataScopePermission ? (
        <div className="rounded-none border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          You have report access but no expense data scope. Ask admin to grant one of:
          expenses:read_own, expenses:read_all, or approval scope permissions.
        </div>
      ) : null}

      {hasDataScopePermission ? (
        <div className="rounded-none border bg-card p-3 text-xs text-muted-foreground">
          Source: {sourceLabel}
        </div>
      ) : null}

      {hasDataScopePermission && isLoadingData && sourceExpenses.length === 0 ? (
        <div className="rounded-none border bg-card p-4 text-sm text-muted-foreground">
          Loading report data...
        </div>
      ) : null}

      {hasDataScopePermission && dataError ? (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load report data: {dataError.message}
        </div>
      ) : null}

      <ReportsSummaryCards expenses={filteredExpenses} />

      <ReportsFilters
        filters={filters}
        departments={departments}
        activeFilterCount={activeFilterCount}
        resultCount={filteredExpenses.length}
        canExport={canExport && filteredExpenses.length > 0}
        onChange={(next) => setFilters((current) => ({ ...current, ...next }))}
        onClear={() => setFilters(initialFilters)}
        onExport={handleExport}
      />

      <ExpenseTable
        expenses={filteredExpenses}
        showSubmitter
        showDepartment
        showApprover
        showActions={false}
        emptyMessage="No expenses found for the selected report filters."
      />
    </DashboardLayout>
  )
}

function toCsv(expenses: ReportExpense[]) {
  const headers = [
    "Title",
    "Amount",
    "Currency",
    "Category",
    "Expense Date",
    "Status",
    "Submitted By",
    "Department",
    "Approved By",
    "Approved At",
  ]

  const lines = expenses.map((expense) => {
    const values = [
      expense.title,
      expense.amount.toFixed(2),
      expense.currency,
      expense.category ?? "",
      expense.expenseDate,
      expense.status,
      expense.submittedBy,
      expense.departmentName ?? "",
      expense.approvedBy ?? "",
      expense.approvedAt ?? "",
    ]

    return values.map(escapeCsvValue).join(",")
  })

  return [headers.join(","), ...lines].join("\n")
}

function escapeCsvValue(value: string) {
  const escaped = value.replace(/"/g, '""')
  return `"${escaped}"`
}

function downloadCsv(content: string, fileName: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

function getCurrentMonth() {
  const now = new Date()
  const month = `${now.getMonth() + 1}`.padStart(2, "0")
  return `${now.getFullYear()}-${month}`
}


