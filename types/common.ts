import { z } from "zod"

export const ApiErrorSchema = z.object({
  status: z.number(),
  message: z.string(),
  errors: z.record(z.string(), z.string()).nullable(),
})

export type ApiError = z.infer<typeof ApiErrorSchema>

export const ExpenseStatusEnum = z.enum([
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
])

export type ExpenseStatus = z.infer<typeof ExpenseStatusEnum>

export type PermissionKey =
  | "expenses:create"
  | "expenses:read_own"
  | "expenses:read_all"
  | "expenses:approve"
  | "expenses:reject"
  | "reports:read"
  | "reports:export"
  | "users:create"
  | "users:read"
  | "users:update"
  | "settings:read"
  | "settings:update"
  | "categories:create"
  | "categories:read"
  | "categories:update"
  | "categories:delete"
  | "departments:create"
  | "departments:read"
  | "departments:update"
  | "departments:delete"

// export type PaginatedResponse<T> = {
//   content: T[]
//   totalElements: number
//   totalPages: number
//   page: number
//   size: number
// }
