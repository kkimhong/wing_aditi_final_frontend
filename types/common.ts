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

export const PERMISSIONS = {
  // Expenses
  EXPENSES_CREATE: "expenses:create",
  EXPENSES_READ_OWN: "expenses:read_own",
  EXPENSES_READ_ALL: "expenses:read_all",
  EXPENSES_SUBMIT: "expenses:submit",
  EXPENSES_APPROVE: "expenses:approve",
  EXPENSES_APPROVE_OWN: "expenses:approve_own",
  EXPENSES_REJECT: "expenses:reject",

  // Reports
  REPORTS_READ: "reports:read",
  REPORTS_EXPORT: "reports:export",

  // Users
  USERS_CREATE: "users:create",
  USERS_READ: "users:read",
  USERS_UPDATE: "users:update",

  // Roles
  ROLES_CREATE: "roles:create",
  ROLES_READ: "roles:read",
  ROLES_UPDATE: "roles:update",
  ROLES_DELETE: "roles:delete",

  // Categories
  CATEGORIES_CREATE: "categories:create",
  CATEGORIES_READ: "categories:read",
  CATEGORIES_UPDATE: "categories:update",
  CATEGORIES_DELETE: "categories:delete",

  // Departments
  DEPARTMENTS_CREATE: "departments:create",
  DEPARTMENTS_READ: "departments:read",
  DEPARTMENTS_UPDATE: "departments:update",
  DEPARTMENTS_DELETE: "departments:delete",

  // Permissions
  PERMISSIONS_READ: "permissions:read",
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export type PaginatedResponse<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}
