"use client"

import type { ReactNode } from "react"
import type { ApprovalExpense } from "../schema/approvalSchema"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ExpenseStatusBadge } from "@/features/expenses/components/ExpenseStatusBadge"

interface ApprovalExpenseDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: ApprovalExpense | null
}

export function ApprovalExpenseDetailsDialog({
  open,
  onOpenChange,
  expense,
}: ApprovalExpenseDetailsDialogProps) {
  if (!expense) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{expense.title}</DialogTitle>
          <DialogDescription>
            Submitted by {expense.submittedBy} on {new Date(expense.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-2">
          <DetailItem label="Amount" value={formatAmount(expense.amount, expense.currency)} />
          <DetailItem label="Status" value={<ExpenseStatusBadge status={expense.status} />} />
          <DetailItem label="Category" value={expense.category ?? "-"} />
          <DetailItem label="Department" value={expense.departmentName ?? "-"} />
          <DetailItem label="Expense Date" value={new Date(expense.expenseDate).toLocaleDateString()} />
          <DetailItem label="Approved By" value={expense.approvedBy ?? "-"} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Notes
          </p>
          <div className="rounded-none border p-3 text-sm text-muted-foreground">
            {expense.notes ?? "No notes provided."}
          </div>
        </div>

        {expense.receiptUrl ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Receipt Image
            </p>
            <div className="overflow-hidden rounded-none border">
              <img
                src={expense.receiptUrl}
                alt={`Receipt for ${expense.title}`}
                className="max-h-80 w-full object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">No receipt</Badge>
            No image uploaded
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="rounded-none border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  )
}

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}
