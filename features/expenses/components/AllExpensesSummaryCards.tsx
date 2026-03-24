"use client"

import type { ExpenseResponse } from "../types/expenseTypes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AllExpensesSummaryCardsProps {
  expenses: ExpenseResponse[]
}

export function AllExpensesSummaryCards({ expenses }: AllExpensesSummaryCardsProps) {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const pendingAmount = expenses
    .filter((expense) => expense.status === "SUBMITTED")
    .reduce((sum, expense) => sum + expense.amount, 0)
  const approvedAmount = expenses
    .filter((expense) => expense.status === "APPROVED")
    .reduce((sum, expense) => sum + expense.amount, 0)
  const rejectedCount = expenses.filter((expense) => expense.status === "REJECTED").length

  const metrics = [
    {
      label: "Total Expenses",
      value: expenses.length.toString(),
      helper: "Across all departments",
    },
    {
      label: "Total Value",
      value: formatCurrency(totalAmount),
      helper: "All submitted records",
    },
    {
      label: "Pending Review",
      value: formatCurrency(pendingAmount),
      helper: "Waiting for approval",
    },
    {
      label: "Approved Value",
      value: formatCurrency(approvedAmount),
      helper: `${rejectedCount} rejected item${rejectedCount === 1 ? "" : "s"}`,
    },
  ]

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {metric.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.helper}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}
