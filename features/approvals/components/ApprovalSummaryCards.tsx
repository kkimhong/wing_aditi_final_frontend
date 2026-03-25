"use client"

import type { ApprovalExpense } from "../schema/approvalSchema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ApprovalSummaryCardsProps {
  expenses: ApprovalExpense[]
}

export function ApprovalSummaryCards({ expenses }: ApprovalSummaryCardsProps) {
  const pending = expenses.filter((expense) => expense.status === "SUBMITTED")
  const approved = expenses.filter((expense) => expense.status === "APPROVED")
  const rejected = expenses.filter((expense) => expense.status === "REJECTED")

  const pendingAmount = pending.reduce((sum, expense) => sum + expense.amount, 0)
  const approvedAmount = approved.reduce((sum, expense) => sum + expense.amount, 0)
  const avgPending = pending.length > 0 ? pendingAmount / pending.length : 0

  const cards = [
    {
      title: "Pending Queue",
      value: pending.length.toString(),
      helper: formatCurrency(pendingAmount),
    },
    {
      title: "Approved",
      value: approved.length.toString(),
      helper: formatCurrency(approvedAmount),
    },
    {
      title: "Rejected",
      value: rejected.length.toString(),
      helper: "Needs follow-up",
    },
    {
      title: "Avg Pending",
      value: formatCurrency(avgPending),
      helper: "Per submission",
    },
  ]

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="rounded-none stats-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.helper}</p>
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

