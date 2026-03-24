"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ExpenseTable } from "./ExpenseTable"
import { AllExpensesFilters, type AllExpensesFiltersState } from "./AllExpensesFilters"
import { AllExpensesSummaryCards } from "./AllExpensesSummaryCards"
import { mockMyExpenses } from "./expenseMockData"
import type { ExpenseResponse } from "../types/expenseTypes"

const mockAllExpenses: ExpenseResponse[] = [
  ...mockMyExpenses,
  {
    id: "9f7915d0-3062-47eb-b5fc-c8f4ef83e14b",
    title: "Client Dinner",
    amount: 480,
    currency: "USD",
    category: "Meals",
    categoryId: "22222222-2222-4222-8222-222222222222",
    expenseDate: "2026-03-16",
    status: "APPROVED",
    submittedBy: "Lina Park",
    departmentName: "Sales",
    notes: "Q1 client meeting",
    receiptUrl: null,
    approvedBy: "Marcus Chen",
    approvedAt: "2026-03-17T03:30:00.000Z",
    createdAt: "2026-03-16T12:15:00.000Z",
  },
  {
    id: "be8122ff-b6f5-4abd-83ba-7bf7d03f3df1",
    title: "AWS Credits Top-up",
    amount: 1500,
    currency: "USD",
    category: "Software",
    categoryId: "33333333-3333-4333-8333-333333333333",
    expenseDate: "2026-03-14",
    status: "SUBMITTED",
    submittedBy: "Diego Romero",
    departmentName: "Platform",
    notes: null,
    receiptUrl: null,
    approvedBy: null,
    approvedAt: null,
    createdAt: "2026-03-14T09:00:00.000Z",
  },
  {
    id: "30420735-3999-4e19-ad35-b63484664cf2",
    title: "Recruitment Fair Booth",
    amount: 920,
    currency: "USD",
    category: "Training",
    categoryId: "44444444-4444-4444-8444-444444444444",
    expenseDate: "2026-03-09",
    status: "REJECTED",
    submittedBy: "Ruth Lin",
    departmentName: "People Ops",
    notes: "Budget exceeded",
    receiptUrl: null,
    approvedBy: "Marcus Chen",
    approvedAt: "2026-03-10T10:00:00.000Z",
    createdAt: "2026-03-09T10:15:00.000Z",
  },
  {
    id: "723697e0-fbe9-4277-b0ea-2882e2548772",
    title: "Office Printer Toner",
    amount: 210,
    currency: "USD",
    category: "Office Supplies",
    categoryId: "55555555-5555-4555-8555-555555555555",
    expenseDate: "2026-03-07",
    status: "DRAFT",
    submittedBy: "Nadia Sam",
    departmentName: "Operations",
    notes: null,
    receiptUrl: null,
    approvedBy: null,
    approvedAt: null,
    createdAt: "2026-03-07T08:10:00.000Z",
  },
]

const initialFilters: AllExpensesFiltersState = {
  search: "",
  status: "ALL",
  department: "ALL",
  category: "ALL",
  startDate: "",
  endDate: "",
}

export function AllExpensesPage() {
  const [filters, setFilters] = useState<AllExpensesFiltersState>(initialFilters)

  const departments = useMemo(() => {
    const values = new Set(
      mockAllExpenses
        .map((expense) => expense.departmentName)
        .filter((department): department is string => Boolean(department))
    )

    return Array.from(values).sort()
  }, [])

  const categories = useMemo(() => {
    const values = new Set(
      mockAllExpenses
        .map((expense) => expense.category)
        .filter((category): category is string => Boolean(category))
    )

    return Array.from(values).sort()
  }, [])

  const filteredExpenses = useMemo(() => {
    return mockAllExpenses.filter((expense) => {
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
  }, [filters])

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

  return (
    <DashboardLayout title="All Expenses">
      {/* <section className="rounded-none border bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Organization ledger
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          Review all department expenses with unified filtering
        </h2>
      </section> */}

      <AllExpensesSummaryCards expenses={filteredExpenses} />

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
