"use client"

import type { ComponentType } from "react"
import { Badge } from "@/components/ui/badge"
import { type ExpenseStatus } from "@/types/common"
import { CheckCircle2, Clock3, FileText, XCircle } from "lucide-react"

const statusConfig: Record<
  ExpenseStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
    icon: ComponentType<{ className?: string }>
  }
> = {
  DRAFT: {
    label: "Draft",
    variant: "outline",
    icon: FileText,
  },
  SUBMITTED: {
    label: "Submitted",
    variant: "secondary",
    icon: Clock3,
  },
  APPROVED: {
    label: "Approved",
    variant: "default",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    variant: "destructive",
    icon: XCircle,
  },
}

export function ExpenseStatusBadge({ status }: { status: ExpenseStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}
