"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AccessDenied } from "@/components/access-denied"
import { ExpenseTable } from "./ExpenseTable"
import { AllExpensesFilters, type AllExpensesFiltersState } from "./AllExpensesFilters"
import { AllExpensesSummaryCards } from "./AllExpensesSummaryCards"
import { useAuthStore } from "@/store/authStore"
import { ACCESS_RULES, hasAnyPermission } from "@/lib/rbac"
import { useAllExpenses } from "@/features/approvals/hook/useApproval"

const initialFilters: AllExpensesFiltersState = {
  search: "",
  status: "ALL",
  department: "ALL",
  category: "ALL",
  startDate: "",
  endDate: "",
}

export function AllExpensesPage() {
  const { permissions, roleName } = useAuthStore()
  const canViewPage = hasAnyPermission(roleName, permissions, ACCESS_RULES.viewAllExpenses)

  const [filters, setFilters] = useState<AllExpensesFiltersState>(initialFilters)
  const { data: fetchedExpenses, isLoading, error } = useAllExpenses(canViewPage)

  const allExpenses = fetchedExpenses ?? []

  const departments = useMemo(() => {
    const values = new Set(
      allExpenses
        .map((expense) => expense.departmentName)
        .filter((department): department is string => Boolean(department))
    )

    return Array.from(values).sort()
  }, [allExpenses])

  const categories = useMemo(() => {
    const values = new Set(
      allExpenses
        .map((expense) => expense.category)
        .filter((category): category is string => Boolean(category))
    )

    return Array.from(values).sort()
  }, [allExpenses])

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((expense) => {
      const searchTerm = filters.search.trim().toLowerCase()

      const matchesSearch =
        searchTerm.length === 0 ||
        expense.title.toLowerCase().includes(searchTerm) ||
        expense.submittedBy.toLowerCase().includes(searchTerm) ||
        (expense.departmentName ?? "").toLowerCase().includes(searchTerm)

      const matchesStatus =
        filters.status === "ALL" || expense.status === filters.status

      const matchesDepartment =
        filters.department === "ALL" || expense.departmentName === filters.department

      const matchesCategory =
        filters.category === "ALL" || expense.category === filters.category

      const matchesStartDate =
        !filters.startDate || expense.expenseDate >= filters.startDate

      const matchesEndDate = !filters.endDate || expense.expenseDate <= filters.endDate

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDepartment &&
        matchesCategory &&
        matchesStartDate &&
        matchesEndDate
      )
    })
  }, [allExpenses, filters])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search.trim()) count += 1
    if (filters.status !== "ALL") count += 1
    if (filters.department !== "ALL") count += 1
    if (filters.category !== "ALL") count += 1
    if (filters.startDate) count += 1
    if (filters.endDate) count += 1
    return count
  }, [filters])

  const updateFilters = (next: Partial<AllExpensesFiltersState>) => {
    setFilters((current) => ({ ...current, ...next }))
  }

  if (!canViewPage) {
    return (
      <DashboardLayout title="All Expenses">
        <AccessDenied description="You are not allowed to view company-wide expenses." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="All Expenses">
      <AllExpensesSummaryCards expenses={filteredExpenses} />

      {isLoading && allExpenses.length === 0 ? (
        <div className="rounded-none border bg-card p-4 text-sm text-muted-foreground">
          Loading expenses...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load expenses: {error.message}
        </div>
      ) : null}

      <AllExpensesFilters
        filters={filters}
        departments={departments}
        categories={categories}
        activeFilterCount={activeFilterCount}
        resultCount={filteredExpenses.length}
        onChange={updateFilters}
        onClear={() => setFilters(initialFilters)}
      />

      <ExpenseTable
        expenses={filteredExpenses}
        showSubmitter
        showDepartment
        showApprover
        showActions={false}
        emptyMessage="No expenses match your current filters."
      />
    </DashboardLayout>
  )
}
