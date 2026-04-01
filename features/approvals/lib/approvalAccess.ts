import type { ApprovalExpense } from "../schema/approvalSchema"
import { ACCESS_RULES, canManageAllExpenses, hasAnyPermission } from "@/lib/rbac"

export function canManageAllApprovals(
  roleName: string | null,
  permissions: string[]
) {
  return canManageAllExpenses(roleName, permissions)
}

export function canAccessApprovalWorkspace(
  roleName: string | null,
  permissions: string[]
) {
  return hasAnyPermission(roleName, permissions, ACCESS_RULES.viewApprovals)
}

export function canApproveExpense(
  expense: ApprovalExpense,
  canManageAll: boolean,
  approverDepartment: string
) {
  if (canManageAll) {
    return true
  }

  return expense.departmentName === approverDepartment
}
