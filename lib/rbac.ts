import { PERMISSIONS } from "@/types/common"
import type { PermissionKey } from "@/types/common"

export { PERMISSIONS }
export type { PermissionKey }

export const ACCESS_RULES = {
  viewMyExpenses: [PERMISSIONS.EXPENSES_READ_OWN],
  createExpense: [PERMISSIONS.EXPENSES_CREATE],
  submitExpense: [PERMISSIONS.EXPENSES_SUBMIT, PERMISSIONS.EXPENSES_CREATE],
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
  void roleName
  return false
}

export function hasPermission(
  roleName: string | null | undefined,
  permissions: readonly string[] | null | undefined,
  requiredPermission: string
) {
  void roleName

  if (!requiredPermission) {
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
  void roleName

  if (!requiredPermissions || requiredPermissions.length === 0) {
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
  void roleName

  if (!requiredPermissions || requiredPermissions.length === 0) {
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
  return hasPermission(roleName, permissions, PERMISSIONS.EXPENSES_READ_ALL)
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
