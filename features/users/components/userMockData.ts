import type { UserResponse } from "../schema/userSchema"

export interface UserSelectOption {
  id: string
  name: string
}

export const departmentOptions: UserSelectOption[] = [
  { id: "11111111-1111-4111-8111-111111111111", name: "Engineering" },
  { id: "22222222-2222-4222-8222-222222222222", name: "Finance" },
  { id: "33333333-3333-4333-8333-333333333333", name: "Operations" },
  { id: "44444444-4444-4444-8444-444444444444", name: "Human Resources" },
]

export const roleOptions: UserSelectOption[] = [
  { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", name: "Administrator" },
  { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", name: "Manager" },
  { id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", name: "Employee" },
]

export const mockUsers: UserResponse[] = [
  {
    id: "7f61865f-b33f-4ec9-bce6-74950f5879ee",
    firstname: "Lyra",
    lastname: "Admin",
    email: "lyra.admin@company.com",
    roleName: "Administrator",
    departmentName: "Engineering",
    isActive: true,
    permissions: ["*"],
    createdAt: "2026-01-10T03:00:00.000Z",
  },
  {
    id: "533ed593-6706-4ea6-9aa1-3d95048d1244",
    firstname: "Marcus",
    lastname: "Chen",
    email: "marcus.chen@company.com",
    roleName: "Manager",
    departmentName: "Finance",
    isActive: true,
    permissions: ["expenses:read_all", "approvals:approve"],
    createdAt: "2026-01-12T05:30:00.000Z",
  },
  {
    id: "78d77df0-4a22-4112-95d8-3707be5cf6d4",
    firstname: "Nita",
    lastname: "Sok",
    email: "nita.sok@company.com",
    roleName: "Employee",
    departmentName: "Engineering",
    isActive: true,
    permissions: ["expenses:create", "expenses:submit"],
    createdAt: "2026-01-20T08:15:00.000Z",
  },
  {
    id: "21772352-0d46-4d95-af77-ea437145f926",
    firstname: "Dara",
    lastname: "Lim",
    email: "dara.lim@company.com",
    roleName: "Employee",
    departmentName: "Operations",
    isActive: false,
    permissions: ["expenses:create", "expenses:submit"],
    createdAt: "2026-02-01T09:00:00.000Z",
  },
]
