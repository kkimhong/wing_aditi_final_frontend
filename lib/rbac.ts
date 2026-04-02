import { PERMISSIONS } from "@/types/common"
import type { PermissionKey } from "@/types/common"

export { PERMISSIONS }
export type { PermissionKey }

const ADMIN_ROLE_NAMES = new Set([
  "ADMIN",
  "ADMINISTRATOR",
  "SUPER_ADMIN",
  "SUPERADMIN",
  "OWNER",
])

export const ACCESS_RULES = {
  viewMyExpenses: [PERMISSIONS.EXPENSES_READ_OWN],
  createExpense: [PERMISSIONS.EXPENSES_CREATE],
  submitExpense: [PERMISSIONS.EXPENSES_SUBMIT],
  viewApprovals: [
    PERMISSIONS.EXPENSES_APPROVE,
    PERMISSIONS.EXPENSES_APPROVE_OWN,
  ],
  approveExpense: [
    PERMISSIONS.EXPENSES_APPROVE,
    PERMISSIONS.EXPENSES_APPROVE_OWN,
  ],
  rejectExpense: [PERMISSIONS.EXPENSES_REJECT],
  viewAllExpenses: [PERMISSIONS.EXPENSES_READ_ALL],
  viewReports: [PERMISSIONS.REPORTS_READ],
  exportReports: [PERMISSIONS.REPORTS_EXPORT],
  viewUsers: [PERMISSIONS.USERS_READ],
  createUsers: [PERMISSIONS.USERS_CREATE],
  updateUsers: [PERMISSIONS.USERS_UPDATE],
  viewCategories: [PERMISSIONS.CATEGORIES_READ],
  createCategories: [PERMISSIONS.CATEGORIES_CREATE],
  updateCategories: [PERMISSIONS.CATEGORIES_UPDATE],
  deleteCategories: [PERMISSIONS.CATEGORIES_DELETE],
  viewDepartments: [PERMISSIONS.DEPARTMENTS_READ],
  createDepartments: [PERMISSIONS.DEPARTMENTS_CREATE],
  updateDepartments: [PERMISSIONS.DEPARTMENTS_UPDATE],
  deleteDepartments: [PERMISSIONS.DEPARTMENTS_DELETE],
  viewRoles: [PERMISSIONS.ROLES_READ],
  createRoles: [PERMISSIONS.ROLES_CREATE],
  updateRoles: [PERMISSIONS.ROLES_UPDATE],
  deleteRoles: [PERMISSIONS.ROLES_DELETE],
  viewPermissions: [PERMISSIONS.PERMISSIONS_READ],
  // Backward-compatible alias still used in settings pages.
  manageRoles: [
    PERMISSIONS.ROLES_READ,
    PERMISSIONS.ROLES_CREATE,
    PERMISSIONS.ROLES_UPDATE,
    PERMISSIONS.ROLES_DELETE,
    PERMISSIONS.PERMISSIONS_READ,
  ],
} as const satisfies Record<string, readonly PermissionKey[]>

export function isAdminRole(roleName: string | null | undefined) {
  if (typeof roleName !== "string") {
    return false
  }

  const normalized = normalizeRoleName(roleName)
  return ADMIN_ROLE_NAMES.has(normalized)
}

export function hasPermission(
  roleName: string | null | undefined,
  permissions: readonly string[] | null | undefined,
  requiredPermission: string
) {
  if (!requiredPermission) {
    return true
  }

  if (isAdminRole(roleName)) {
    return true
  }

  const required = normalizePermissionKey(requiredPermission)
  if (!required) {
    return true
  }

  return toPermissionSet(permissions).has(required)
}

export function hasAnyPermission(
  roleName: string | null | undefined,
  permissions: readonly string[] | null | undefined,
  requiredPermissions: readonly string[] | null | undefined
) {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true
  }

  if (isAdminRole(roleName)) {
    return true
  }

  const permissionSet = toPermissionSet(permissions)

  return requiredPermissions.some((permission) =>
    permissionSet.has(normalizePermissionKey(permission))
  )
}

export function hasAllPermissions(
  roleName: string | null | undefined,
  permissions: readonly string[] | null | undefined,
  requiredPermissions: readonly string[] | null | undefined
) {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true
  }

  if (isAdminRole(roleName)) {
    return true
  }

  const permissionSet = toPermissionSet(permissions)

  return requiredPermissions.every((permission) =>
    permissionSet.has(normalizePermissionKey(permission))
  )
}

export function canManageAllExpenses(
  roleName: string | null | undefined,
  permissions: readonly string[] | null | undefined
) {
  return hasAnyPermission(roleName, permissions, [
    PERMISSIONS.EXPENSES_APPROVE,
    PERMISSIONS.EXPENSES_READ_ALL,
  ])
}

export function canAccessSettings(
  roleName: string | null | undefined,
  permissions: readonly string[] | null | undefined
) {
  return hasAnyPermission(roleName, permissions, [
    ...ACCESS_RULES.viewDepartments,
    ...ACCESS_RULES.createDepartments,
    ...ACCESS_RULES.updateDepartments,
    ...ACCESS_RULES.deleteDepartments,
    ...ACCESS_RULES.manageRoles,
  ])
}

function normalizeRoleName(value: string) {
  const role = value.trim().toUpperCase()
  return role.startsWith("ROLE_") ? role.slice(5) : role
}

function toPermissionSet(values: readonly string[] | null | undefined) {
  return new Set(
    (values ?? [])
      .map((value) => normalizePermissionKey(value))
      .filter(Boolean)
  )
}

function normalizePermissionKey(value: string | null | undefined) {
  if (typeof value !== "string") {
    return ""
  }

  return value.trim().toLowerCase()
}
