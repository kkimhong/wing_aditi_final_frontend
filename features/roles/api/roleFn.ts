import { api, getApiErrorMessage } from "@/lib/axios"
import type {
  AssignPermissionsRequest,
  PermissionResponse,
  RoleRequest,
  RoleResponse,
} from "../schema/roleSchema"

export const roleQueryKey = ["roles"] as const
export const permissionQueryKey = ["permissions"] as const
export const rolePermissionQueryKey = permissionQueryKey

export const getRolesFn = async (): Promise<RoleResponse[]> => {
  try {
    const response = await api.get("/roles")
    const payload = response.data?.data ?? response.data

    return toCollection(payload)
      .map(normalizeRole)
      .filter((role): role is RoleResponse => role !== null)
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch roles"))
  }
}

export const createRoleFn = async (payload: RoleRequest): Promise<void> => {
  try {
    await api.post("/roles", toRolePayload(payload))
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to create role"))
  }
}

export const updateRoleFn = async (
  id: string,
  payload: RoleRequest
): Promise<void> => {
  try {
    await api.put(`/roles/${id}`, toRolePayload(payload))
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to update role"))
  }
}

export const deleteRoleFn = async (id: string): Promise<void> => {
  try {
    await api.delete(`/roles/${id}`)
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to delete role"))
  }
}

export const getAllPermissionsFn = async (): Promise<PermissionResponse[]> => {
  try {
    const response = await api.get("/permissions")
    const payload = response.data?.data ?? response.data

    return toCollection(payload)
      .map(normalizePermission)
      .filter((permission): permission is PermissionResponse => permission !== null)
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch permissions"))
  }
}

export const assignRolePermissionsFn = async (
  roleId: string,
  payload: AssignPermissionsRequest
): Promise<void> => {
  const requestBody = {
    permissionIds: payload.permissionIds,
  }

  try {
    await api.put(`/roles/${roleId}/permissions`, requestBody)
    return
  } catch (putError: unknown) {
    if (!shouldRetryAssignPermissionsWithPost(putError)) {
      throw new Error(
        getApiErrorMessage(putError, "Failed to assign role permissions")
      )
    }

    try {
      await api.post(`/roles/${roleId}/permissions`, requestBody)
      return
    } catch (postError: unknown) {
      throw new Error(
        getApiErrorMessage(
          postError ?? putError,
          "Failed to assign role permissions"
        )
      )
    }
  }
}

function shouldRetryAssignPermissionsWithPost(error: unknown) {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return true
  }

  const status = (
    error as {
      response?: {
        status?: unknown
      }
    }
  ).response?.status

  if (typeof status !== "number") {
    return true
  }

  return status === 404 || status === 405 || status === 501
}

function normalizeRole(raw: unknown): RoleResponse | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const row = raw as Record<string, unknown>
  const id = toNonEmptyString(row.id)
  const name = toNonEmptyString(row.name)

  if (!id || !name) {
    return null
  }

  const permissions = toPermissions(row.permissions)
  const permissionIds =
    toStringArray(row.permissionIds ?? row.permission_ids).length > 0
      ? toStringArray(row.permissionIds ?? row.permission_ids)
      : permissions.map((permission) => permission.id)

  return {
    id,
    name,
    description: toNullableString(row.description),
    priority: toNumber(row.priority, 0),
    permissions,
    permissionIds,
    permissionCount: toNumber(
      row.permissionCount ?? row.permission_count,
      permissionIds.length
    ),
    userCount: resolveUserCount(row),
  }
}

function normalizePermission(raw: unknown): PermissionResponse | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const row = raw as Record<string, unknown>

  const rawModule =
    toNullableString(row.module) ??
    toNullableString(row.group) ??
    toNullableString(row.domain)

  const rawAction =
    toNullableString(row.action) ??
    toNullableString(row.name) ??
    toNullableString(row.permission)

  const rawKey =
    toNullableString(row.key) ??
    toNullableString(row.code) ??
    toNullableString(row.authority)

  const parsedFromKey = parsePermissionKey(rawKey)
  const parsedFromAction = parsePermissionKey(rawAction)

  const moduleName =
    rawModule ??
    parsedFromKey?.module ??
    parsedFromAction?.module ??
    "General"
  const action =
    (parsedFromKey?.action ?? parsedFromAction?.action ?? rawAction)?.trim() ?? ""

  if (!action) {
    return null
  }

  const key = rawKey ?? `${toKeyChunk(moduleName)}:${toKeyChunk(action)}`
  const id =
    toNullableString(row.id) ??
    toNullableString(row.permissionId ?? row.permission_id) ??
    key

  return {
    id,
    module: moduleName,
    action,
    key,
  }
}

function toRolePayload(payload: RoleRequest) {
  const normalizedPermissionIds = Array.isArray(payload.permissionIds)
    ? payload.permissionIds
        .map((id) => toNullableString(id))
        .filter((id): id is string => Boolean(id))
    : []

  const requestBody: Record<string, unknown> = {
    name: payload.name,
    description: payload.description?.trim() || null,
    priority: payload.priority,
  }

  if (normalizedPermissionIds.length > 0) {
    requestBody.permissionIds = normalizedPermissionIds
  }

  return requestBody
}

function resolveUserCount(row: Record<string, unknown>) {
  const explicitCount = toNumber(
    row.userCount ??
      row.user_count ??
      row.assignedUsersCount ??
      row.assigned_users_count,
    -1
  )

  if (explicitCount >= 0) {
    return explicitCount
  }

  const users = row.users
  if (Array.isArray(users)) {
    return users.length
  }

  const members = row.members
  if (Array.isArray(members)) {
    return members.length
  }

  return 0
}

function toPermissions(value: unknown): PermissionResponse[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map(normalizePermission)
    .filter((permission): permission is PermissionResponse => permission !== null)
}

function toCollection(value: unknown) {
  if (Array.isArray(value)) {
    return value
  }

  if (!value || typeof value !== "object") {
    return []
  }

  const row = value as Record<string, unknown>

  if (Array.isArray(row.content)) {
    return row.content
  }

  if (Array.isArray(row.items)) {
    return row.items
  }

  if (Array.isArray(row.results)) {
    return row.results
  }

  return []
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => toNullableString(item))
    .filter((item): item is string => Boolean(item))
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

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function toNonEmptyString(value: unknown) {
  return toNullableString(value) ?? ""
}

function parsePermissionKey(value: string | null) {
  if (!value || !value.includes(":")) {
    return null
  }

  const [left, ...rest] = value.split(":")
  const moduleName = toNullableString(left)
  const action = toNullableString(rest.join(":"))

  if (!moduleName || !action) {
    return null
  }

  return { module: moduleName, action }
}

function toKeyChunk(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}
