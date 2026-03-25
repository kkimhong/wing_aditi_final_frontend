"use client"

import type { ExpenseResponse } from "../types/expenseTypes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ExpenseSummaryCardsProps {
  expenses: ExpenseResponse[]
}

export function ExpenseSummaryCards({ expenses }: ExpenseSummaryCardsProps) {
  const totalSubmitted = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const pendingReview = expenses
    .filter((expense) => expense.status === "SUBMITTED")
    .reduce((sum, expense) => sum + expense.amount, 0)
  const approvedTotal = expenses
    .filter((expense) => expense.status === "APPROVED")
    .reduce((sum, expense) => sum + expense.amount, 0)
  const draftCount = expenses.filter((expense) => expense.status === "DRAFT").length

  const metrics = [
    {
      title: "Total Value",
      value: formatCurrency(totalSubmitted),
      description: `${expenses.length} expense entries`,
    },
    {
      title: "Pending Review",
      value: formatCurrency(pendingReview),
      description: "Waiting for approval",
    },
    {
      title: "Approved",
      value: formatCurrency(approvedTotal),
      description: "Processed amount",
    },
    {
      title: "Drafts",
      value: draftCount.toString(),
      description: "Not submitted yet",
    },
  ]

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="rounded-none stats-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
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

