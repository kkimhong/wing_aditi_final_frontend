export const PERMISSIONS = {
  EXPENSES_CREATE: "expenses:create",
  EXPENSES_READ_OWN: "expenses:read_own",
  EXPENSES_READ_ALL: "expenses:read_all",
  EXPENSES_SUBMIT: "expenses:submit",
  EXPENSES_APPROVE: "expenses:approve",
  EXPENSES_REJECT: "expenses:reject",

  // Legacy aliases still used in some mock/UI flows
  APPROVALS_APPROVE: "approvals:approve",
  APPROVALS_REJECT: "approvals:reject",

  REPORTS_READ: "reports:read",
  REPORTS_EXPORT: "reports:export",

  USERS_CREATE: "users:create",
  USERS_READ: "users:read",
  USERS_UPDATE: "users:update",

  CATEGORIES_CREATE: "categories:create",
  CATEGORIES_READ: "categories:read",
  CATEGORIES_UPDATE: "categories:update",
  CATEGORIES_DELETE: "categories:delete",

  DEPARTMENTS_CREATE: "departments:create",
  DEPARTMENTS_READ: "departments:read",
  DEPARTMENTS_UPDATE: "departments:update",
  DEPARTMENTS_DELETE: "departments:delete",

  ROLES_READ: "roles:read",
  ROLES_CREATE: "roles:create",
  ROLES_UPDATE: "roles:update",
  ROLES_DELETE: "roles:delete",

  SETTINGS_READ: "settings:read",
  SETTINGS_UPDATE: "settings:update",

  // Backward compatibility with earlier frontend naming
  SETTINGS_MANAGE_ROLES: "settings:manage_roles",
} as const

export const ACCESS_RULES = {
  viewMyExpenses: [
    PERMISSIONS.EXPENSES_READ_OWN,
    PERMISSIONS.EXPENSES_READ_ALL,
    PERMISSIONS.EXPENSES_CREATE,
    PERMISSIONS.EXPENSES_SUBMIT,
  ],
  createExpense: [PERMISSIONS.EXPENSES_CREATE],
  submitExpense: [PERMISSIONS.EXPENSES_SUBMIT],

  viewApprovals: [
    PERMISSIONS.EXPENSES_APPROVE,
    PERMISSIONS.EXPENSES_REJECT,
    PERMISSIONS.APPROVALS_APPROVE,
    PERMISSIONS.APPROVALS_REJECT,
  ],
  approveExpense: [PERMISSIONS.EXPENSES_APPROVE, PERMISSIONS.APPROVALS_APPROVE],
  rejectExpense: [PERMISSIONS.EXPENSES_REJECT, PERMISSIONS.APPROVALS_REJECT],

  viewAllExpenses: [PERMISSIONS.EXPENSES_READ_ALL],

  viewReports: [PERMISSIONS.REPORTS_READ, PERMISSIONS.REPORTS_EXPORT],
  exportReports: [PERMISSIONS.REPORTS_EXPORT],

  viewUsers: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
  ],
  createUsers: [PERMISSIONS.USERS_CREATE],
  updateUsers: [PERMISSIONS.USERS_UPDATE],

  viewCategories: [
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_UPDATE,
    PERMISSIONS.CATEGORIES_DELETE,
  ],
  createCategories: [PERMISSIONS.CATEGORIES_CREATE],
  updateCategories: [PERMISSIONS.CATEGORIES_UPDATE],
  deleteCategories: [PERMISSIONS.CATEGORIES_DELETE],

  viewDepartments: [
    PERMISSIONS.DEPARTMENTS_READ,
    PERMISSIONS.DEPARTMENTS_CREATE,
    PERMISSIONS.DEPARTMENTS_UPDATE,
    PERMISSIONS.DEPARTMENTS_DELETE,
  ],
  createDepartments: [PERMISSIONS.DEPARTMENTS_CREATE],
  updateDepartments: [PERMISSIONS.DEPARTMENTS_UPDATE],
  deleteDepartments: [PERMISSIONS.DEPARTMENTS_DELETE],

  manageRoles: [
    PERMISSIONS.ROLES_READ,
    PERMISSIONS.ROLES_CREATE,
    PERMISSIONS.ROLES_UPDATE,
    PERMISSIONS.ROLES_DELETE,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.SETTINGS_MANAGE_ROLES,
  ],
} as const

const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  MANAGER: [
    PERMISSIONS.EXPENSES_CREATE,
    PERMISSIONS.EXPENSES_READ_OWN,
    PERMISSIONS.EXPENSES_SUBMIT,
    PERMISSIONS.EXPENSES_APPROVE,
    PERMISSIONS.EXPENSES_REJECT,
    PERMISSIONS.REPORTS_READ,
  ],
  EMPLOYEE: [
    PERMISSIONS.EXPENSES_CREATE,
    PERMISSIONS.EXPENSES_READ_OWN,
    PERMISSIONS.EXPENSES_SUBMIT,
    PERMISSIONS.REPORTS_READ,
  ],
}

const ALIAS_GROUPS: string[][] = [
  [PERMISSIONS.EXPENSES_APPROVE, PERMISSIONS.APPROVALS_APPROVE],
  [PERMISSIONS.EXPENSES_REJECT, PERMISSIONS.APPROVALS_REJECT],
  [PERMISSIONS.SETTINGS_UPDATE, PERMISSIONS.SETTINGS_MANAGE_ROLES],
]

function normalizeValue(value: string) {
  return value.trim().toLowerCase()
}

function normalizeRoleName(roleName: string | null | undefined) {
  if (typeof roleName !== "string") {
    return null
  }

  const normalized = roleName.trim().toUpperCase()
  return normalized.length > 0 ? normalized : null
}

function expandAliases(permissionSet: Set<string>) {
  for (const group of ALIAS_GROUPS) {
    const hasAny = group.some((permission) => permissionSet.has(permission))
    if (!hasAny) {
      continue
    }

    for (const permission of group) {
      permissionSet.add(permission)
    }
  }
}

export function isAdminRole(roleName: string | null | undefined) {
  const normalizedRole = normalizeRoleName(roleName)
  return normalizedRole === "ADMIN" || normalizedRole === "ADMINISTRATOR"
}

export function buildPermissionSet(
  roleName: string | null | undefined,
  permissions: string[]
) {
  const set = new Set<string>()

  for (const permission of permissions) {
    if (typeof permission !== "string") {
      continue
    }

    const normalizedPermission = normalizeValue(permission)
    if (normalizedPermission) {
      set.add(normalizedPermission)
    }
  }

  if (isAdminRole(roleName)) {
    set.add("*")
    return set
  }

  if (set.size === 0) {
    const normalizedRole = normalizeRoleName(roleName)
    if (normalizedRole && normalizedRole in ROLE_DEFAULT_PERMISSIONS) {
      for (const permission of ROLE_DEFAULT_PERMISSIONS[normalizedRole]) {
        set.add(normalizeValue(permission))
      }
    }
  }

  expandAliases(set)
  return set
}

export function hasPermission(
  roleName: string | null | undefined,
  permissions: string[],
  requiredPermission: string
) {
  return hasAnyPermission(roleName, permissions, [requiredPermission])
}

export function hasAnyPermission(
  roleName: string | null | undefined,
  permissions: string[],
  requiredPermissions: readonly string[]
) {
  if (requiredPermissions.length === 0) {
    return true
  }

  const permissionSet = buildPermissionSet(roleName, permissions)
  if (permissionSet.has("*")) {
    return true
  }

  return requiredPermissions.some((permission) =>
    permissionSet.has(normalizeValue(permission))
  )
}

export function canManageAllExpenses(
  roleName: string | null | undefined,
  permissions: string[]
) {
  return hasAnyPermission(roleName, permissions, [
    PERMISSIONS.EXPENSES_READ_ALL,
    ...ACCESS_RULES.manageRoles,
  ])
}

export function canAccessSettings(
  roleName: string | null | undefined,
  permissions: string[]
) {
  return hasAnyPermission(roleName, permissions, [
    PERMISSIONS.SETTINGS_READ,
    ...ACCESS_RULES.manageRoles,
    ...ACCESS_RULES.viewDepartments,
  ])
}
