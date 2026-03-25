"use client"

import type { ReportExpense } from "../schema/reportSchema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ReportsSummaryCardsProps {
  expenses: ReportExpense[]
}

export function ReportsSummaryCards({ expenses }: ReportsSummaryCardsProps) {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const approved = expenses
    .filter((expense) => expense.status === "APPROVED")
    .reduce((sum, expense) => sum + expense.amount, 0)
  const submitted = expenses
    .filter((expense) => expense.status === "SUBMITTED")
    .reduce((sum, expense) => sum + expense.amount, 0)
  const departments = new Set(
    expenses
      .map((expense) => expense.departmentName)
      .filter((department): department is string => Boolean(department))
  ).size

  const cards = [
    { label: "Entries", value: expenses.length.toString(), helper: "Filtered records" },
    { label: "Total Amount", value: formatCurrency(total), helper: "All statuses" },
    { label: "Approved", value: formatCurrency(approved), helper: "Approved only" },
    { label: "Submitted", value: formatCurrency(submitted), helper: `${departments} departments` },
  ]

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="rounded-none stats-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {card.label}
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

