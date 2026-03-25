import { z } from "zod"

export const RegisterRequestSchema = z.object({
  firstname: z.string().min(1, "First name is required").max(100, "Too long"),
  lastname: z.string().min(1, "Last name is required").max(100, "Too long"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+=!])/, 
      "Must contain uppercase, number and special character"
    ),
  departmentId: z.string().uuid("Please select a department"),
  roleId: z.string().uuid("Please select a role"),
})

export const UpdateUserRequestSchema = z.object({
  firstname: z.string().min(1).max(100).optional(),
  lastname: z.string().min(1).max(100).optional(),
  departmentId: z.string().uuid().optional(),
  roleId: z.string().uuid().optional(),
})

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  roleName: z.string().nullable(),
  departmentName: z.string().nullable(),
  isActive: z.boolean(),
  permissions: z.array(z.string()),
  createdAt: z.string(),
})

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
