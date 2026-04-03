import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { getApiErrorMessage } from "@/lib/axios"
import {
  approveExpenseFn,
  departmentExpensesQueryKey,
  getAllExpensesFn,
  getDepartmentExpensesFn,
  getExpenseByIdFn,
  getPendingExpensesFn,
  pendingExpensesQueryKey,
  rejectExpenseFn,
} from "../api/approvalFn"
import type { ExpenseFilter } from "@/features/expenses/schema/expenseSchema"
import type { RejectApprovalRequest } from "../schema/approvalSchema"

type MutationErrorHandler = (message: string) => void
type ApprovalApiErrorBody = {
  message?: string
  error?: string
}

type ApprovalMutationError = AxiosError<ApprovalApiErrorBody> | Error

type ApproveMutationOptions = {
  onError?: MutationErrorHandler
}

type RejectMutationOptions = {
  onError?: MutationErrorHandler
}

export const useApprovalExpenses = (enabled = true, canManageAll = false) => {
  return useQuery({
    queryKey: ["expenses", "pending", canManageAll ? "all" : "scoped"],
    queryFn: () => getPendingExpensesFn(),
    staleTime: 60_000,
    enabled,
  })
}

export const useAllExpenses = (enabled = true, filters?: ExpenseFilter) => {
  return useQuery({
    queryKey: ["expenses", "all", filters ?? {}],
    queryFn: () => getAllExpensesFn(filters),
    staleTime: 60_000,
    enabled,
  })
}

export const useDepartmentExpenses = (
  enabled = true,
  filters?: ExpenseFilter
) => {
  return useQuery({
    queryKey: [...departmentExpensesQueryKey, filters ?? {}],
    queryFn: () => getDepartmentExpensesFn(filters),
    staleTime: 60_000,
    enabled,
  })
}

export const usePendingExpenses = (enabled = true, filters?: ExpenseFilter) => {
  return useQuery({
    queryKey: [...pendingExpensesQueryKey, filters ?? {}],
    queryFn: () => getPendingExpensesFn(filters),
    staleTime: 30_000,
    enabled,
  })
}

export const useExpenseDetails = (id: string | null, enabled = true) => {
  return useQuery({
    queryKey: ["expenses", "detail", id],
    queryFn: () => (id ? getExpenseByIdFn(id) : Promise.resolve(null)),
    staleTime: 30_000,
    enabled: enabled && Boolean(id),
  })
}

export const useApproveExpense = (options?: ApproveMutationOptions) => {
  const queryClient = useQueryClient()

  return useMutation<void, ApprovalMutationError, string>({
    mutationFn: (id: string) => approveExpenseFn(id),
    onSuccess: () => invalidateExpenses(queryClient),
    onError: (error) => {
      const message = getApiErrorMessage(
        error,
        error instanceof Error && error.message
          ? error.message
          : "Failed to approve expense"
      )
      options?.onError?.(message)
    },
  })
}

export const useRejectExpense = (options?: RejectMutationOptions) => {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    ApprovalMutationError,
    { id: string; payload: RejectApprovalRequest }
  >({
    mutationFn: ({ id, payload }: { id: string; payload: RejectApprovalRequest }) =>
      rejectExpenseFn(id, payload),
    onSuccess: () => invalidateExpenses(queryClient),
    onError: (error) => {
      const message = getApiErrorMessage(
        error,
        error instanceof Error && error.message
          ? error.message
          : "Failed to reject expense"
      )
      options?.onError?.(message)
    },
  })
}

async function invalidateExpenses(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: ["expenses"] })
}
