import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
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

export const useApprovalExpenses = (enabled = true, canManageAll = false) => {
  return useQuery({
    queryKey: ["expenses", canManageAll ? "all" : "department"],
    queryFn: () => (canManageAll ? getAllExpensesFn() : getDepartmentExpensesFn()),
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

export const useApproveExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => approveExpenseFn(id),
    onSuccess: () => invalidateExpenses(queryClient),
  })
}

export const useRejectExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RejectApprovalRequest }) =>
      rejectExpenseFn(id, payload),
    onSuccess: () => invalidateExpenses(queryClient),
  })
}

async function invalidateExpenses(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: ["expenses"] })
}
