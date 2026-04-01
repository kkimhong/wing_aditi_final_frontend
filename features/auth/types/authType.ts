import { z } from "zod"

export const LoginRequestSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
})

export const AuthResponseSchema = z.object({
  token: z.string(),
  email: z.string().email().optional(),
  roleName: z.string().optional(),
  role: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  authorities: z.array(z.string()).optional(),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
