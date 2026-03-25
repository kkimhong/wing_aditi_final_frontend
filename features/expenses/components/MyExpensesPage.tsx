"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
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
import { expenseCategoryOptions, mockMyExpenses } from "./expenseMockData"
import type { CreateExpenseRequest, ExpenseResponse } from "../types/expenseTypes"
import type { ExpenseStatus } from "@/types/common"
import { Plus, Search } from "lucide-react"

const statusFilterItems: Array<{ label: string; value: "ALL" | ExpenseStatus }> = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
]

export function MyExpensesPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | ExpenseStatus>("ALL")
  const [expenses, setExpenses] = useState<ExpenseResponse[]>(mockMyExpenses)

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

  const handleCreateExpense = (values: CreateExpenseRequest) => {
    const selectedCategory = expenseCategoryOptions.find(
      (category) => category.id === values.categoryId
    )

    const nextExpense: ExpenseResponse = {
      id: createId(),
      title: values.title,
      amount: values.amount,
      currency: values.currency,
      category: selectedCategory?.name ?? null,
      categoryId: values.categoryId,
      expenseDate: values.expenseDate,
      notes: values.notes ?? null,
      receiptUrl: values.receiptUrl || null,
      status: "DRAFT",
      submittedBy: "You",
      departmentName: "Engineering",
      approvedBy: null,
      approvedAt: null,
      createdAt: new Date().toISOString(),
    }

    setExpenses((current) => [nextExpense, ...current])
    setSheetOpen(false)
  }

  const handleExpenseAction = (expense: ExpenseResponse, action: string) => {
    if (action === "delete") {
      setExpenses((current) => current.filter((item) => item.id !== expense.id))
      return
    }

    if (action === "submit") {
      setExpenses((current) =>
        current.map((item) =>
          item.id === expense.id
            ? {
                ...item,
                status: "SUBMITTED",
              }
            : item
        )
      )
    }
  }

  return (
    <DashboardLayout
      title="My Expenses"
      actions={
        <Button size="sm" className="gap-1.5" onClick={() => setSheetOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          New Expense
        </Button>
      }
    >
      {/* <section className="rounded-none border bg-gradient-to-r from-slate-50 via-white to-slate-100 p-5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Expense workspace
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Track, submit, and monitor your expenses</h2>
      </section> */}

      <ExpenseSummaryCards expenses={expenses} />

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
        onRowAction={handleExpenseAction}
        emptyMessage="No expenses match your current filters."
      />

      <ExpenseCreateSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onCreate={handleCreateExpense}
        categories={expenseCategoryOptions}
      />
    </DashboardLayout>
  )
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}


