import { z } from "zod"
import { ExpenseStatusEnum } from "@/types/common"
import { ExpenseResponseSchema } from "@/features/expenses/types/expenseTypes"

export const ReportExportModeSchema = z.enum(["MONTHLY", "FILTERED_RANGE"])

export const ReportStatusFilterSchema = z.union([
  z.literal("ALL"),
  ExpenseStatusEnum,
])

export const ReportFiltersSchema = z.object({
  status: ReportStatusFilterSchema,
  department: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  month: z.string(),
  exportMode: ReportExportModeSchema,
})

export const ReportExpenseSchema = ExpenseResponseSchema

export type ReportExportMode = z.infer<typeof ReportExportModeSchema>
export type ReportStatusFilter = z.infer<typeof ReportStatusFilterSchema>
export type ReportFilters = z.infer<typeof ReportFiltersSchema>
export type ReportExpense = z.infer<typeof ReportExpenseSchema>
