import { z } from "zod"

export const CategoryRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Name too long"),
  description: z
    .string()
    .max(255, "Description too long")
    .optional()
    .nullable(),
  limitPerSubmission: z
    .number()
    .min(0.01, "Limit must be greater than 0")
    .optional()
    .nullable(),
})

export const CategoryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  limitPerSubmission: z.number().nullable(),
  active: z.boolean(),
  createdAt: z.string(),
})

export type CategoryRequest = z.infer<typeof CategoryRequestSchema>
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>
