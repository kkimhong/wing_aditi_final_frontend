"use client"

import { useRouter } from "next/navigation"
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
        const tokenClaims =
          typeof token === "string" ? decodeJwtPayload(token) : null

        const permissions = extractPermissions(payload, tokenClaims)
        const roleName = normalizeRoleName(
          payload?.roleName ?? payload?.role ?? tokenClaims?.roleName ?? tokenClaims?.role
        )
        const departmentName =
          firstNonEmptyString(
            payload?.departmentName,
            payload?.department,
            tokenClaims?.departmentName,
            tokenClaims?.department
          ) ?? null

        const email =
          firstNonEmptyString(
            payload?.email,
            payload?.sub,
            tokenClaims?.sub,
            data?.email
          ) ?? null

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

function normalizeRoleName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const role = value.trim()
  return role.length > 0 ? role : null
}

function extractPermissions(
  payload: any,
  tokenClaims: Record<string, unknown> | null
) {
  const fromPayload = [
    ...toStringArray(payload?.permissions),
    ...toStringArray(payload?.authorities),
  ]

  if (fromPayload.length > 0) {
    return uniqueStrings(fromPayload)
  }

  const fromToken = [
    ...toStringArray(tokenClaims?.permissions),
    ...toStringArray(tokenClaims?.authorities),
    ...toStringArray(tokenClaims?.scope),
    ...toStringArray(tokenClaims?.scopes),
  ]

  return uniqueStrings(fromToken)
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (typeof value === "string") {
    return value
      .split(" ")
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}

function firstNonEmptyString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string") {
      const next = value.trim()
      if (next.length > 0) {
        return next
      }
    }
  }

  return null
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const segments = token.split(".")
    if (segments.length < 2) {
      return null
    }

    const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")
    const json = atob(padded)
    const parsed = JSON.parse(json)

    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>
    }

    return null
  } catch {
    return null
  }
}
