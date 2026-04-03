import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ExpenseScope = "COMPANY" | "DEPARTMENT"

interface AuthStore {
  email: string | null
  token: string | null
  permissions: string[]
  roleName: string | null
  departmentName: string | null
  expenseScope: ExpenseScope | null
  setAuth: (
    email: string,
    token: string | null,
    permissions: string[],
    roleName?: string | null,
    departmentName?: string | null,
    expenseScope?: ExpenseScope | null
  ) => void
  clearAuth: () => void
  hasPermission: (permission: string) => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      email: null,
      token: null,
      permissions: [],
      roleName: null,
      departmentName: null,
      expenseScope: null,

      setAuth: (
        email,
        token,
        permissions,
        roleName = null,
        departmentName = null,
        expenseScope = null
      ) =>
        set({
          email,
          token,
          permissions,
          roleName,
          departmentName,
          expenseScope,
        }),

      clearAuth: () => {
        set({
          email: null,
          token: null,
          permissions: [],
          roleName: null,
          departmentName: null,
          expenseScope: null,
        })
      },

      hasPermission: (permission: string) =>
        get().permissions.includes(permission),
    }),
    { name: "auth-storage" }
  )
)
