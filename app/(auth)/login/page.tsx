"use client"

import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { useLogin } from "@/features/auth/hook/useLogin"
import { useAuthStore } from "@/store/authStore"

export default function Page() {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const { mutate, isPending } = useLogin()

  const handleLogin = (data: any) => {
    mutate(data, {
      onSuccess: (res) => {
        const payload = res?.data ?? res
        const token = payload?.token
        const email = payload?.email ?? data?.email ?? null
        const permissions = Array.isArray(payload?.permissions)
          ? payload.permissions
          : []
        const roleName = normalizeRoleName(payload?.roleName ?? payload?.role)
        const departmentName =
          typeof payload?.departmentName === "string"
            ? payload.departmentName
            : typeof payload?.department === "string"
              ? payload.department
              : null

        if (typeof token === "string" && token.length > 0) {
          Cookies.set("access_token", token, { sameSite: "lax" })
        }

        if (email) {
          setAuth(email, permissions, roleName, departmentName)
        }

        router.push("/dashboard")
      },
      onError: (err: any) => {
        console.error("Login failed:", err)
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginForm onSubmit={handleLogin} isLoading={isPending} />
    </div>
  )
}

function normalizeRoleName(
  value: unknown
): "ADMIN" | "MANAGER" | "EMPLOYEE" | null {
  if (typeof value !== "string") {
    return null
  }

  const upper = value.toUpperCase()
  if (upper === "ADMIN" || upper === "MANAGER" || upper === "EMPLOYEE") {
    return upper
  }

  return null
}
