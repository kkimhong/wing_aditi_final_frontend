// store/authStore.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import Cookies from "js-cookie"

interface AuthStore {
  email: string | null
  permissions: string[]
  roleName: "ADMIN" | "MANAGER" | "EMPLOYEE" | null
  departmentName: string | null
  setAuth: (
    email: string,
    permissions: string[],
    roleName?: "ADMIN" | "MANAGER" | "EMPLOYEE" | null,
    departmentName?: string | null
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

      setAuth: (email, permissions, roleName = null, departmentName = null) =>
        set({ email, permissions, roleName, departmentName }),

      clearAuth: () => {
        Cookies.remove("access_token")
        Cookies.remove("permissions")
        set({
          email: null,
          permissions: [],
          roleName: null,
          departmentName: null,
        })
      },

      hasPermission: (permission: string) =>
        get().permissions.includes(permission),
    }),
    { name: "auth-storage" }
  )
)
