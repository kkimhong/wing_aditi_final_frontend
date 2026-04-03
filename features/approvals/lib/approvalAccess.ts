import type { ApprovalExpense } from "../schema/approvalSchema"
import { ACCESS_RULES, hasAnyPermission } from "@/lib/rbac"
import type { ExpenseScope } from "@/store/authStore"

export function canManageAllApprovals(
  roleName: string | null,
  permissions: string[],
  expenseScope: ExpenseScope | null
) {
  if (expenseScope === "COMPANY") {
    return true
  }

  if (expenseScope === "DEPARTMENT") {
    return false
  }

  // Fallback for old sessions where scope is missing.
  return hasAnyPermission(roleName, permissions, ACCESS_RULES.viewAllExpenses)
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
  approverDepartment: string | null
) {
  if (canManageAll) {
    return true
  }

  if (!approverDepartment || looksLikeUuid(approverDepartment)) {
    // If auth payload only provides department id, rely on backend scope checks.
    return true
  }

  const expenseDepartment = expense.departmentName?.trim().toLowerCase()
  const approverDepartmentName = approverDepartment.trim().toLowerCase()

  if (!expenseDepartment) {
    return true
  }

  return expenseDepartment === approverDepartmentName
}

function looksLikeUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  )
}
