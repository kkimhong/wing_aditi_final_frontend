import { api, getApiErrorMessage } from "@/lib/axios"
import type {
  AssignPermissionsRequest,
  PermissionResponse,
  RoleRequest,
  RoleResponse,
} from "../schema/roleSchema"

export type RoleWithPermissionsResponse = RoleResponse & {
  permissionIds: string[]
}

export const roleQueryKey = ["roles"] as const
export const rolePermissionQueryKey = ["permissions"] as const

export const getRolesFn = async (): Promise<RoleWithPermissionsResponse[]> => {
  try {
    const response = await api.get("/roles")
    const payload = response.data?.data ?? response.data

    if (!Array.isArray(payload)) {
      return []
    }

    return payload
      .map(normalizeRole)
      .filter((role): role is RoleWithPermissionsResponse => role !== null)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to fetch roles")
    throw new Error(message)
  }
}

export const createRoleFn = async (payload: RoleRequest) => {
  try {
    await api.post("/roles", toRolePayload(payload))
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to create role")
    throw new Error(message)
  }
}

export const updateRoleFn = async (id: string, payload: RoleRequest) => {
  try {
    await api.put(`/roles/${id}`, toRolePayload(payload))
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to update role")
    throw new Error(message)
  }
}

export const deleteRoleFn = async (id: string) => {
  try {
    await api.delete(`/roles/${id}`)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to delete role")
    throw new Error(message)
  }
}

export const getPermissionsFn = async (): Promise<PermissionResponse[]> => {
  const tryPaths = ["/permissions", "/roles/permissions"]
  let lastError: unknown = null

  for (const path of tryPaths) {
    try {
      const response = await api.get(path)
      const payload = response.data?.data ?? response.data

      if (!Array.isArray(payload)) {
        return []
      }

      return payload
        .map(normalizePermission)
        .filter(
          (permission): permission is PermissionResponse => permission !== null
        )
    } catch (error: unknown) {
      lastError = error
    }
  }

  // Some backends do not expose a dedicated permissions endpoint.
  // Treat 404 as "no remote catalog" and let UI fallback to local derived catalog.
  if (getErrorStatus(lastError) === 404) {
    return []
  }

  const message = getApiErrorMessage(lastError, "Failed to fetch permissions")
  throw new Error(message)
}

export const assignRolePermissionsFn = async (
  roleId: string,
  payload: AssignPermissionsRequest
) => {
  const requestBody = {
    permissionIds: payload.permissionIds,
  }

  try {
    await api.put(`/roles/${roleId}/permissions`, requestBody)
  } catch (firstError: unknown) {
    try {
      await api.post(`/roles/${roleId}/permissions`, requestBody)
    } catch (secondError: unknown) {
      const message = getApiErrorMessage(
        secondError ?? firstError,
        "Failed to assign role permissions"
      )
      throw new Error(message)
    }
  }
}

function normalizeRole(raw: unknown): RoleWithPermissionsResponse | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const row = raw as Record<string, unknown>
  const id = String(row.id ?? "").trim()
  const name = String(row.name ?? "").trim()

  if (!id || !name) {
    return null
  }

  const permissionIds = toPermissionIds(
    row.permissionIds ?? row.permission_ids ?? row.permissions
  )

  return {
    id,
    name,
    description: toNullableString(row.description),
    priority: toNumber(row.priority, 0),
    permissionCount: toNumber(
      row.permissionCount ?? row.permission_count,
      permissionIds.length
    ),
    permissionIds,
  }
}

function normalizePermission(raw: unknown): PermissionResponse | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const row = raw as Record<string, unknown>
  const id = String(row.id ?? row.permissionId ?? row.permission_id ?? "").trim()
  const moduleName =
    toNullableString(row.module) ?? toNullableString(row.group) ?? "General"

  const rawAction =
    toNullableString(row.action) ??
    toNullableString(row.name) ??
    toNullableString(row.permission)

  if (!id || !rawAction) {
    return null
  }

  const action = rawAction.includes(":")
    ? rawAction.split(":")[1] ?? rawAction
    : rawAction

  return {
    id,
    module: moduleName,
    action,
  }
}

function toRolePayload(payload: RoleRequest) {
  return {
    name: payload.name,
    description: payload.description?.trim() || null,
    priority: payload.priority,
  }
}

function toPermissionIds(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim()
      }

      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>
        const id = String(row.id ?? row.permissionId ?? row.permission_id ?? "").trim()
        return id
      }

      return ""
    })
    .filter((id): id is string => Boolean(id))
}

function toNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return fallback
}

function toNullableString(value: unknown) {
  if (typeof value !== "string") {
    return null
  }

  const next = value.trim()
  return next.length > 0 ? next : null
}

function getErrorStatus(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { status?: unknown } }).response?.status ===
      "number"
  ) {
    return (error as { response?: { status?: number } }).response?.status ?? null
  }

  return null
}
