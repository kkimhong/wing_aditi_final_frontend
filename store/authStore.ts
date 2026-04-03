import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ExpenseScope = "COMPANY" | "DEPARTMENT"

interface AuthStore {
  email: string | null
  permissions: string[]
  roleName: string | null
  departmentName: string | null
  expenseScope: ExpenseScope | null
  setAuth: (
    email: string,
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
      permissions: [],
      roleName: null,
      departmentName: null,
      expenseScope: null,

      setAuth: (
        email,
        permissions,
        roleName = null,
        departmentName = null,
        expenseScope = null
      ) =>
        set({
          email,
          permissions,
          roleName,
          departmentName,
          expenseScope,
        }),

      clearAuth: () => {
        set({
          email: null,
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
