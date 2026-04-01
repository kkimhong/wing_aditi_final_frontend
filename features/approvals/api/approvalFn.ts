import { api, getApiErrorMessage } from "@/lib/axios"
import type { ExpenseFilter } from "@/features/expenses/schema/expenseSchema"
import {
  normalizeExpense,
  toExpenseCollection,
} from "@/features/expenses/api/expensesFn"
import type {
  ApprovalExpense,
  RejectApprovalRequest,
} from "../schema/approvalSchema"

export const allExpensesQueryKey = ["expenses", "all"] as const
export const departmentExpensesQueryKey = ["expenses", "department"] as const
export const pendingExpensesQueryKey = ["expenses", "pending"] as const
export const approvalExpenseDetailQueryKey = ["expenses", "detail"] as const

export const getAllExpensesFn = async (
  filters?: ExpenseFilter
): Promise<ApprovalExpense[]> => {
  try {
    const response = await api.get("/expenses", {
      params: toExpenseFilterParams(filters),
    })
    const payload = response.data?.data ?? response.data
    return toExpenseCollection(payload)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to fetch all expenses")
    throw new Error(message)
  }
}

export const getDepartmentExpensesFn = async (
  filters?: ExpenseFilter
): Promise<ApprovalExpense[]> => {
  try {
    const response = await api.get("/expenses/department", {
      params: toExpenseFilterParams(filters),
    })
    const payload = response.data?.data ?? response.data
    return toExpenseCollection(payload)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to fetch department expenses")
    throw new Error(message)
  }
}

export const getPendingExpensesFn = async (
  filters?: ExpenseFilter
): Promise<ApprovalExpense[]> => {
  try {
    const response = await api.get("/expenses/pending", {
      params: toExpenseFilterParams(filters),
    })
    const payload = response.data?.data ?? response.data
    return toExpenseCollection(payload)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to fetch pending expenses")
    throw new Error(message)
  }
}

export const getExpenseByIdFn = async (
  id: string
): Promise<ApprovalExpense | null> => {
  try {
    const response = await api.get(`/expenses/${id}`)
    const payload = response.data?.data ?? response.data
    return normalizeExpense(payload)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to fetch expense details")
    throw new Error(message)
  }
}

export const approveExpenseFn = async (id: string) => {
  try {
    await api.patch(`/expenses/${id}/approve`)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to approve expense")
    throw new Error(message)
  }
}

export const rejectExpenseFn = async (
  id: string,
  payload: RejectApprovalRequest
) => {
  try {
    await api.patch(`/expenses/${id}/reject`, {
      comment: payload.comment.trim(),
    })
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to reject expense")
    throw new Error(message)
  }
}

function toExpenseFilterParams(filters?: ExpenseFilter) {
  if (!filters) {
    return undefined
  }

  return {
    status: filters.status,
    departmentId: filters.departmentId,
    categoryId: filters.categoryId,
    startDate: filters.startDate,
    endDate: filters.endDate,
  }
}
