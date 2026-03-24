import { z } from "zod"

export const DepartmentRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Department name is required")
    .max(255, "Name too long"),
  budgetLimit: z
    .number()
    .min(0, "Budget cannot be negative")
    .optional()
    .nullable(),
})

export const DepartmentResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  budgetLimit: z.number().nullable(),
  userCount: z.number(),
  createdAt: z.string(),
})

export type DepartmentRequest = z.infer<typeof DepartmentRequestSchema>
export type DepartmentResponse = z.infer<typeof DepartmentResponseSchema>
