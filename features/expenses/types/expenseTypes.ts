import { z } from "zod"
import { ExpenseStatusEnum } from "@/types/common"

export const CreateExpenseRequestSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  amount: z
    .number({ message: "Amount is required" })
    .min(0.01, "Amount must be greater than 0"),
  currency: z.string().length(3, "Must be 3-letter ISO code"),
  categoryId: z.string().uuid("Please select a category"),
  expenseDate: z.string().min(1, "Expense date is required"),
  notes: z.string().max(500, "Notes too long").nullish(),
  receiptUrl: z.union([z.string().url("Invalid URL"), z.literal("")]).nullish(),
})

export const UpdateExpenseRequestSchema =
  CreateExpenseRequestSchema.partial().extend({
    status: ExpenseStatusEnum.optional(),
  })

export const RejectExpenseRequestSchema = z.object({
  comment: z
    .string()
    .min(1, "Please provide a reason for rejection")
    .max(500, "Comment too long"),
})

export const ExpenseResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  amount: z.number(),
  currency: z.string(),
  category: z.string().nullable(),
  categoryId: z.string().uuid().nullable(),
  expenseDate: z.string(),
  notes: z.string().nullable(),
  receiptUrl: z.string().nullable(),
  status: ExpenseStatusEnum,
  submittedBy: z.string(),
  submittedByEmail: z.string().nullable().optional(),
  departmentName: z.string().nullable(),
  approvedBy: z.string().nullable(),
  approvedAt: z.string().nullable(),
  createdAt: z.string(),
})

export const ExpenseFilterSchema = z.object({
  status: ExpenseStatusEnum.optional(),
  departmentId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type CreateExpenseRequest = z.infer<typeof CreateExpenseRequestSchema>
export type UpdateExpenseRequest = z.infer<typeof UpdateExpenseRequestSchema>
export type RejectExpenseRequest = z.infer<typeof RejectExpenseRequestSchema>
export type ExpenseResponse = z.infer<typeof ExpenseResponseSchema>
export type ExpenseFilter = z.infer<typeof ExpenseFilterSchema>
