import { api, getApiErrorMessage } from "@/lib/axios"
import type {
  RegisterRequest,
  UserResponse,
} from "../schema/userSchema"

export const userQueryKey = ["users"] as const

export const userFn = async (): Promise<UserResponse[]> => {
  try {
    const response = await api.get("/users")
    const payload = response.data?.data ?? response.data

    if (!Array.isArray(payload)) {
      return []
    }

    return payload
      .map(normalizeUser)
      .filter((user): user is UserResponse => user !== null)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to fetch users")
    throw new Error(message)
  }
}

export const registerUserFn = async (payload: RegisterRequest) => {
  const requestBody = toRegisterPayload(payload)

  try {
    await api.post("/users/register", requestBody)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to register user")
    throw new Error(message)
  }
}

export const toggleUserStatusFn = async (user: UserResponse, isActive: boolean) => {
  const statusPayload = { isActive }

  try {
    await api.patch(`/users/${user.id}/status`, statusPayload)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to update user status")
    throw new Error(message)
  }
}

function normalizeUser(raw: unknown): UserResponse | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const row = raw as Record<string, unknown>

  const id = String(row.id ?? "").trim()
  const firstname = String(row.firstname ?? row.firstName ?? "").trim()
  const lastname = String(row.lastname ?? row.lastName ?? "").trim()
  const email = String(row.email ?? "").trim()

  if (!id || !firstname || !lastname || !email) {
    return null
  }

  return {
    id,
    firstname,
    lastname,
    email,
    roleId: toNullableString(
      row.roleId ?? (row.role as Record<string, unknown> | null)?.id
    ),
    roleName:
      toNullableString(row.roleName) ??
      toNullableString((row.role as Record<string, unknown> | null)?.name),
    departmentId: toNullableString(
      row.departmentId ?? (row.department as Record<string, unknown> | null)?.id
    ),
    departmentName:
      toNullableString(row.departmentName) ??
      toNullableString((row.department as Record<string, unknown> | null)?.name),
    isActive: toBoolean(
      row.isActive ?? row.active ?? row.enabled ?? row.status ?? true
    ),
    permissions: toStringArray(row.permissions ?? row.authorities),
    createdAt: String(row.createdAt ?? row.created_at ?? new Date().toISOString()),
  }
}

function toRegisterPayload(payload: RegisterRequest) {
  return {
    firstname: payload.firstname,
    lastname: payload.lastname,
    email: payload.email,
    password: payload.password,
    departmentId: payload.departmentId,
    roleId: payload.roleId,
  }
}

function toNullableString(value: unknown) {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
}

function toBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "number") {
    return value !== 0
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()

    if (
      normalized === "active" ||
      normalized === "enabled" ||
      normalized === "true" ||
      normalized === "1"
    ) {
      return true
    }

    if (
      normalized === "inactive" ||
      normalized === "disabled" ||
      normalized === "false" ||
      normalized === "0"
    ) {
      return false
    }
  }

  return false
}
