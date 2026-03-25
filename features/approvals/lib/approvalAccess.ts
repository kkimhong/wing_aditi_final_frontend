import type { ApprovalExpense } from "../schema/approvalSchema"

type RoleName = "ADMIN" | "MANAGER" | "EMPLOYEE" | null

export function canManageAllApprovals(
  roleName: RoleName,
  permissions: string[]
) {
  if (!roleName && permissions.length === 0) {
    return true
  }

  return (
    roleName === "ADMIN" ||
    permissions.includes("settings:manage_roles") ||
    permissions.includes("expenses:read_all")
  )
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
