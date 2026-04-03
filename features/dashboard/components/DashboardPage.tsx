"use client"

import Link from "next/link"
import { useMemo } from "react"
import { ArrowRight, FileClock, Receipt, Wallet } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/authStore"
import { ACCESS_RULES, hasAnyPermission } from "@/lib/rbac"
import { useMyExpenses } from "@/features/expenses/hook/useExpense"
import {
  useAllExpenses,
  useApprovalExpenses,
  useDepartmentExpenses,
} from "@/features/approvals/hook/useApproval"
import { canManageAllApprovals } from "@/features/approvals/lib/approvalAccess"
import { ExpenseStatusBadge } from "@/features/expenses/components/ExpenseStatusBadge"
import type { ExpenseResponse } from "@/features/expenses/schema/expenseSchema"

export function DashboardPage() {
  const { permissions, roleName, departmentName, expenseScope } = useAuthStore()

  const canViewMyExpenses = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.viewMyExpenses
  )
  const canViewApprovals = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.viewApprovals
  )
  const canViewAllExpenses = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.viewAllExpenses
  )
  const canViewReports = hasAnyPermission(roleName, permissions, ACCESS_RULES.viewReports)

  const canManageAll = useMemo(
    () => canManageAllApprovals(roleName, permissions, expenseScope),
    [permissions, roleName, expenseScope]
  )

  const {
    data: myExpenses = [],
    isLoading: isLoadingMyExpenses,
    error: myExpensesError,
  } = useMyExpenses(canViewMyExpenses)
  const {
    data: approvalExpenses = [],
    isLoading: isLoadingApprovalExpenses,
    error: approvalExpensesError,
  } = useApprovalExpenses(canViewApprovals, canManageAll)
  const {
    data: allExpensesRaw = [],
    isLoading: isLoadingAllExpensesRaw,
    error: allExpensesErrorRaw,
  } = useAllExpenses(canViewAllExpenses && canManageAll)
  const {
    data: departmentExpenses = [],
    isLoading: isLoadingDepartmentExpenses,
    error: departmentExpensesError,
  } = useDepartmentExpenses(canViewAllExpenses && !canManageAll)

  const allExpenses = canManageAll ? allExpensesRaw : departmentExpenses
  const isLoadingAllExpenses = canManageAll
    ? isLoadingAllExpensesRaw
    : isLoadingDepartmentExpenses
  const allExpensesError = canManageAll ? allExpensesErrorRaw : departmentExpensesError

  const visibleExpenses = canViewAllExpenses
    ? allExpenses
    : canViewApprovals
      ? approvalExpenses
      : myExpenses

  const pendingApprovals = useMemo(
    () => approvalExpenses.filter((expense) => expense.status === "SUBMITTED"),
    [approvalExpenses]
  )

  const recentMyExpenses = useMemo(() => {
    return [...myExpenses]
      .sort((a, b) => toEpoch(b.createdAt) - toEpoch(a.createdAt))
      .slice(0, 5)
  }, [myExpenses])

  const summaryCards = useMemo(() => {
    const myTotal = myExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const draftCount = myExpenses.filter((expense) => expense.status === "DRAFT").length
    const visibleTotal = visibleExpenses
      .filter(
        (expense) =>
          expense.status === "SUBMITTED" || expense.status === "APPROVED"
      )
      .reduce((sum, expense) => sum + expense.amount, 0)
    const rejectedCount = visibleExpenses.filter(
      (expense) => expense.status === "REJECTED"
    ).length

    return [
      {
        title: "My Expenses",
        value: myExpenses.length.toString(),
        helper: formatCurrency(myTotal),
        icon: Receipt,
      },
      {
        title: "Pending Approvals",
        value: pendingApprovals.length.toString(),
        helper: canViewApprovals
          ? "Need decision"
          : "No approval access",
        icon: FileClock,
      },
      {
        title: canViewAllExpenses ? "Company Spend" : "Visible Spend",
        value: formatCurrency(visibleTotal),
        helper: "Submitted + approved",
        icon: Wallet,
      },
      {
        title: "Draft / Rejected",
        value: `${draftCount} / ${rejectedCount}`,
        helper: "Needs follow-up",
        icon: ArrowRight,
      },
    ]
  }, [canViewAllExpenses, canViewApprovals, myExpenses, pendingApprovals.length, visibleExpenses])

  const loadErrors = [
    myExpensesError ? `My expenses: ${myExpensesError.message}` : null,
    approvalExpensesError ? `Approvals: ${approvalExpensesError.message}` : null,
    allExpensesError ? `All expenses: ${allExpensesError.message}` : null,
  ].filter((message): message is string => Boolean(message))

  const isInitialLoading =
    (canViewMyExpenses && isLoadingMyExpenses && myExpenses.length === 0) ||
    (canViewApprovals && isLoadingApprovalExpenses && approvalExpenses.length === 0) ||
    (canViewAllExpenses && isLoadingAllExpenses && allExpenses.length === 0)

  const scopeLabel = canViewAllExpenses
    ? canManageAll
      ? "Company-wide visibility"
      : "Department visibility"
    : canViewApprovals
      ? canManageAll
        ? "Company approvals scope"
        : `${departmentName ?? "Department"} approvals scope`
      : "Personal visibility"

  return (
    <DashboardLayout
      title="Dashboard"
      actions={
        <div className="flex items-center gap-2">
          {canViewMyExpenses ? (
            <Button variant="outline" size="sm" asChild>
              <Link href="/expenses">My Expenses</Link>
            </Button>
          ) : null}
          {canViewApprovals ? (
            <Button variant="outline" size="sm" asChild>
              <Link href="/approval">Approvals</Link>
            </Button>
          ) : null}
          {canViewReports ? (
            <Button size="sm" asChild>
              <Link href="/reports">Reports</Link>
            </Button>
          ) : null}
        </div>
      }
    >
      <section className="rounded-none border bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Overview
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          Live snapshot of expenses and approvals
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">{scopeLabel}</p>
      </section>

      {isInitialLoading ? (
        <div className="rounded-none border bg-card p-4 text-sm text-muted-foreground">
          Loading dashboard data...
        </div>
      ) : null}

      {loadErrors.length > 0 ? (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {loadErrors.join(" | ")}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="rounded-none stats-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                {card.title}
                <card.icon className="h-3.5 w-3.5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle>Recent My Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentMyExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent personal expenses yet.
              </p>
            ) : (
              recentMyExpenses.map((expense) => (
                <ExpenseListItem key={expense.id} expense={expense} />
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader>
            <CardTitle>Approval Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!canViewApprovals ? (
              <p className="text-sm text-muted-foreground">
                You do not have approval workspace access.
              </p>
            ) : pendingApprovals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No submitted expenses pending approval.
              </p>
            ) : (
              pendingApprovals
                .slice(0, 5)
                .map((expense) => <ExpenseListItem key={expense.id} expense={expense} />)
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function ExpenseListItem({ expense }: { expense: ExpenseResponse }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-none border p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{expense.title}</p>
        <p className="text-xs text-muted-foreground">
          {expense.expenseDate} - {expense.category ?? "Uncategorized"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold">{formatCurrency(expense.amount)}</p>
        <ExpenseStatusBadge status={expense.status} />
      </div>
    </div>
  )
}

function toEpoch(value: string) {
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}


