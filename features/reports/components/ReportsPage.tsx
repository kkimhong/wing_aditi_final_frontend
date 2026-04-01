"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AccessDenied } from "@/components/access-denied"
import { ExpenseTable } from "@/features/expenses/components/ExpenseTable"
import { ReportsSummaryCards } from "./ReportsSummaryCards"
import { ReportsFilters } from "./ReportsFilters"
import { reportExpenses } from "./reportMockData"
import type { ReportExpense, ReportFilters } from "../schema/reportSchema"
import { useAuthStore } from "@/store/authStore"
import { ACCESS_RULES, hasAnyPermission } from "@/lib/rbac"

const initialFilters: ReportFilters = {
  status: "ALL",
  department: "ALL",
  startDate: "",
  endDate: "",
  month: getCurrentMonth(),
  exportMode: "MONTHLY",
}

export function ReportsPage() {
  const { permissions, roleName } = useAuthStore()
  const canViewPage = hasAnyPermission(roleName, permissions, ACCESS_RULES.viewReports)
  const canExport = hasAnyPermission(roleName, permissions, ACCESS_RULES.exportReports)

  const [filters, setFilters] = useState<ReportFilters>(initialFilters)

  const departments = useMemo(() => {
    const values = new Set(
      reportExpenses
        .map((expense) => expense.departmentName)
        .filter((department): department is string => Boolean(department))
    )

    return Array.from(values).sort()
  }, [])

  const filteredExpenses = useMemo(() => {
    return reportExpenses.filter((expense) => {
      const matchesStatus = filters.status === "ALL" || expense.status === filters.status
      const matchesDepartment =
        filters.department === "ALL" || expense.departmentName === filters.department
      const matchesStartDate = !filters.startDate || expense.expenseDate >= filters.startDate
      const matchesEndDate = !filters.endDate || expense.expenseDate <= filters.endDate

      return matchesStatus && matchesDepartment && matchesStartDate && matchesEndDate
    })
  }, [filters])

  const monthlyExpenses = useMemo(() => {
    if (!filters.month) return reportExpenses

    return reportExpenses.filter((expense) => expense.expenseDate.startsWith(filters.month))
  }, [filters.month])

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
          Export monthly expenses or exports based on a filtered duration
        </h2>
      </section>

      <ReportsSummaryCards expenses={filteredExpenses} />

      <ReportsFilters
        filters={filters}
        departments={departments}
        activeFilterCount={activeFilterCount}
        resultCount={filteredExpenses.length}
        canExport={canExport}
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
