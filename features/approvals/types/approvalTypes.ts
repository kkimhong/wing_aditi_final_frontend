import { z } from "zod"
import { ExpenseStatusEnum } from "@/types/common"
import {
  ExpenseResponseSchema,
  RejectExpenseRequestSchema,
} from "@/features/expenses/types/expenseTypes"

export const ApprovalStatusFilterSchema = z.union([
  z.literal("ALL"),
  ExpenseStatusEnum,
])

export const ApprovalFiltersSchema = z.object({
  search: z.string(),
  status: ApprovalStatusFilterSchema,
  department: z.string(),
  category: z.string(),
})

export const ApprovalExpenseSchema = ExpenseResponseSchema
export const RejectApprovalRequestSchema = RejectExpenseRequestSchema

export type ApprovalStatusFilter = z.infer<typeof ApprovalStatusFilterSchema>
export type ApprovalFilters = z.infer<typeof ApprovalFiltersSchema>
export type ApprovalExpense = z.infer<typeof ApprovalExpenseSchema>
export type RejectApprovalRequest = z.infer<typeof RejectApprovalRequestSchema>
