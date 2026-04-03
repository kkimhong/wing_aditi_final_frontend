"use client"
// Trigger Deployment
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { useLogin } from "@/features/auth/hook/useLogin"
import type { LoginRequest } from "@/features/auth/types/authType"
import { getApiErrorMessage } from "@/lib/axios"
import { useAuthStore, type ExpenseScope } from "@/store/authStore"

export default function Page() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [loginError, setLoginError] = useState<string | null>(null)

  const { mutate, isPending } = useLogin()

  const handleLogin = (data: LoginRequest) => {
    setLoginError(null)
    mutate(data, {
      onSuccess: (res) => {
        setLoginError(null)
        const payload = resolveAuthPayload(res)
        const token = payload?.token
        const tokenClaims =
          typeof token === "string" ? decodeJwtPayload(token) : null

        const permissions = extractPermissions(payload, tokenClaims)
        const roleName = normalizeRoleName(resolveRoleName(payload, tokenClaims))
        const departmentName = resolveDepartmentName(payload, tokenClaims)
        const expenseScope = resolveExpenseScope(payload, tokenClaims)

        const email =
          firstNonEmptyString(
            payload?.email,
            payload?.sub,
            tokenClaims?.sub,
            data?.email
          ) ?? null

        if (email) {
          setAuth(email, permissions, roleName, departmentName, expenseScope)
        }

        router.push("/dashboard")
      },
      onError: (err: unknown) => {
        const message = getApiErrorMessage(err, "Invalid email or password")
        setLoginError(message)
        console.error("Login failed:", err)
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginForm
        onSubmit={handleLogin}
        isLoading={isPending}
        errorMessage={loginError}
      />
    </div>
  )
}

function normalizeRoleName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const role = value.trim().toUpperCase()
  const normalized = role.startsWith("ROLE_") ? role.slice(5) : role

  if (normalized.length === 0) {
    return null
  }

  return normalized
}

function extractPermissions(
  payload: Record<string, unknown> | null | undefined,
  tokenClaims: Record<string, unknown> | null
) {
  const fromPayload = [
    ...collectPermissionValues(payload),
    ...toStringArray(payload?.roles),
  ]

  const fromToken = [
    ...collectPermissionValues(tokenClaims),
    ...toStringArray(tokenClaims?.roles),
    ...toStringArray((tokenClaims as Record<string, unknown> | null)?.realm_access),
  ]

  const merged = uniqueStrings([...fromPayload, ...fromToken])
  const scopedPermissions = merged.filter((item) => item.includes(":"))

  return scopedPermissions.length > 0 ? scopedPermissions : merged
}

function collectPermissionValues(value: unknown, depth = 0): string[] {
  if (!value || typeof value !== "object" || depth > 2) {
    return []
  }

  const row = value as Record<string, unknown>

  const direct = [
    ...toStringArray(row.permissions),
    ...toStringArray(row.authorities),
    ...toStringArray(row.grants),
    ...toStringArray(row.scope),
    ...toStringArray(row.scopes),
  ]

  const nested = [row.role, row.user, row.account, row.profile, row.data].flatMap(
    (candidate) => collectPermissionValues(candidate, depth + 1)
  )

  return uniqueStrings([...direct, ...nested])
}

function resolveRoleName(
  payload: Record<string, unknown> | null | undefined,
  tokenClaims: Record<string, unknown> | null
) {
  const payloadRole = payload?.role
  const claimRole = tokenClaims?.role
  const payloadRoles = payload?.roles
  const claimRoles = tokenClaims?.roles
  const realmAccess = (tokenClaims as Record<string, unknown> | null)?.realm_access

  const roleFromPayloadObject =
    payloadRole && typeof payloadRole === "object"
      ? firstNonEmptyString(
          (payloadRole as Record<string, unknown>).name,
          (payloadRole as Record<string, unknown>).code
        )
      : null

  const roleFromClaimObject =
    claimRole && typeof claimRole === "object"
      ? firstNonEmptyString(
          (claimRole as Record<string, unknown>).name,
          (claimRole as Record<string, unknown>).code
        )
      : null

  const roleFromPayloadRolesArray = extractRoleFromArray(payloadRoles)
  const roleFromClaimRolesArray = extractRoleFromArray(claimRoles)
  const roleFromRealmAccess =
    realmAccess && typeof realmAccess === "object"
      ? extractRoleFromArray((realmAccess as Record<string, unknown>).roles)
      : null

  return firstNonEmptyString(
    payload?.roleName,
    typeof payloadRole === "string" ? payloadRole : null,
    roleFromPayloadObject,
    roleFromPayloadRolesArray,
    tokenClaims?.roleName,
    typeof claimRole === "string" ? claimRole : null,
    roleFromClaimObject,
    roleFromClaimRolesArray,
    roleFromRealmAccess
  )
}

function resolveExpenseScope(
  payload: Record<string, unknown> | null | undefined,
  tokenClaims: Record<string, unknown> | null
): ExpenseScope | null {
  const rawScope = firstNonEmptyString(payload?.expenseScope, tokenClaims?.expenseScope)
  if (!rawScope) {
    return null
  }

  const normalized = rawScope.trim().toUpperCase()
  if (normalized === "COMPANY" || normalized === "DEPARTMENT") {
    return normalized
  }

  return null
}
function resolveDepartmentName(
  payload: Record<string, unknown> | null | undefined,
  tokenClaims: Record<string, unknown> | null
) {
  const payloadDepartment = extractDepartmentName(payload?.department)
  const tokenDepartment = extractDepartmentName(tokenClaims?.department)

  return (
    firstNonEmptyString(
      payload?.departmentName,
      payloadDepartment,
      tokenClaims?.departmentName,
      tokenDepartment
    ) ?? null
  )
}

function extractDepartmentName(value: unknown) {
  if (!value || typeof value !== "object") {
    return null
  }

  const row = value as Record<string, unknown>
  return firstNonEmptyString(row.name, row.departmentName)
}
function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          const trimmed = item.trim()
          if (!trimmed) {
            return ""
          }

          return trimmed.includes(":")
            ? normalizeScopedPermission(trimmed)
            : trimmed
        }

        if (item && typeof item === "object") {
          const row = item as Record<string, unknown>
          const scopedPermission = firstNonEmptyString(
            row.key,
            row.authority,
            row.permission,
            row.scope,
            row.code
          )

          if (scopedPermission && scopedPermission.includes(":")) {
            return normalizeScopedPermission(scopedPermission)
          }

          const moduleValue = firstNonEmptyString(row.module, row.resource)
          const actionValue = firstNonEmptyString(row.action)

          if (moduleValue && actionValue) {
            return `${normalizePermissionChunk(moduleValue)}:${normalizePermissionChunk(actionValue)}`
          }

          const candidate = firstNonEmptyString(
            row.key,
            row.authority,
            row.permission,
            row.name,
            row.code
          )

          return candidate ?? ""
        }

        return ""
      })
      .filter(Boolean)
  }

  if (typeof value === "string") {
    return value
      .split(/[,\s]+/)
      .map((item) => item.trim())
      .map((item) => (item.includes(":") ? normalizeScopedPermission(item) : item))
      .filter(Boolean)
  }

  if (value && typeof value === "object") {
    const row = value as Record<string, unknown>
    return toStringArray(
      row.permissions ?? row.authorities ?? row.scopes ?? row.scope ?? row.roles
    )
  }

  return []
}

function normalizeScopedPermission(value: string) {
  const [moduleValue, ...actionParts] = value.split(":")
  const actionValue = actionParts.join(":")

  if (!moduleValue || !actionValue) {
    return value.trim().toLowerCase()
  }

  return `${normalizePermissionChunk(moduleValue)}:${normalizePermissionChunk(actionValue)}`
}

function normalizePermissionChunk(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
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

function extractRoleFromArray(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) {
    return null
  }

  for (const item of value) {
    if (typeof item === "string") {
      const role = item.trim()
      if (role.length > 0) {
        return role
      }
    }

    if (item && typeof item === "object") {
      const row = item as Record<string, unknown>
      const role = firstNonEmptyString(row.name, row.code, row.role)
      if (role) {
        return role
      }
    }
  }

  return null
}

function resolveAuthPayload(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return {}
  }

  const root = value as Record<string, unknown>
  const level1 =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : null

  if (looksLikeAuthPayload(level1)) {
    return level1 as Record<string, unknown>
  }

  if (looksLikeAuthPayload(root)) {
    return root
  }

  const level2 =
    level1?.data && typeof level1.data === "object"
      ? (level1.data as Record<string, unknown>)
      : null

  if (looksLikeAuthPayload(level2)) {
    return level2 as Record<string, unknown>
  }

  return (level1 ?? root) as Record<string, unknown>
}

function looksLikeAuthPayload(value: unknown) {
  if (!value || typeof value !== "object") {
    return false
  }

  const row = value as Record<string, unknown>

  return Boolean(
    row.token ||
      row.email ||
      row.roleName ||
      row.role ||
      row.permissions ||
      row.authorities
  )
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





