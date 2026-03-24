import { z } from "zod"

export const RoleRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(100, "Name too long"),
  description: z
    .string()
    .max(255)
    .optional()
    .nullable(),
  priority: z
    .number({ message: "Priority is required" })
    .int("Priority must be a whole number")
    .min(0, "Priority cannot be negative"),
})

export const RoleResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  priority: z.number(),
  permissionCount: z.number(),
})

export const PermissionResponseSchema = z.object({
  id: z.string().uuid(),
  module: z.string(),
  action: z.string(),
})

export const AssignPermissionsRequestSchema = z.object({
  permissionIds: z
    .array(z.string().uuid())
    .min(1, "Select at least one permission"),
})

export type RoleRequest = z.infer<typeof RoleRequestSchema>
export type RoleResponse = z.infer<typeof RoleResponseSchema>
export type PermissionResponse = z.infer<typeof PermissionResponseSchema>
export type AssignPermissionsRequest = z.infer<typeof AssignPermissionsRequestSchema>