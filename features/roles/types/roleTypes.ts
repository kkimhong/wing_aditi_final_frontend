import { z } from "zod"

export const PermissionResponseSchema = z.object({
  id: z.string().min(1, "Permission id is required"),
  module: z.string().min(1, "Permission module is required"),
  action: z.string().min(1, "Permission action is required"),
  key: z.string().min(1, "Permission key is required"),
})

export const AssignPermissionsRequestSchema = z.object({
  permissionIds: z.array(z.string().min(1, "Invalid permission id")),
})

export const RoleRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(100, "Role name cannot exceed 100 characters"),
  description: z
    .string()
    .max(255, "Description cannot exceed 255 characters")
    .optional()
    .nullable(),
  priority: z
    .number({ message: "Priority is required" })
    .int("Priority must be a whole number")
    .min(0, "Priority cannot be negative"),
  permissionIds: z.array(z.string().min(1)).default([]),
})

export const RoleResponseSchema = z.object({
  id: z.string().min(1, "Role id is required"),
  name: z.string().min(1, "Role name is required"),
  description: z.string().nullable(),
  priority: z.number(),
  permissions: z.array(PermissionResponseSchema).default([]),
  permissionIds: z.array(z.string()).optional(),
  permissionCount: z.number().optional(),
  userCount: z.number().optional(),
})

export type RoleRequest = z.infer<typeof RoleRequestSchema>
export type RoleResponse = z.infer<typeof RoleResponseSchema>
export type PermissionResponse = z.infer<typeof PermissionResponseSchema>
export type AssignPermissionsRequest = z.infer<
  typeof AssignPermissionsRequestSchema
>
export type PermissionsByModule = Record<string, PermissionResponse[]>
