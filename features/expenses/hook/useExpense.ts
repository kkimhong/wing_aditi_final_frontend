import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  createExpenseFn,
  deleteExpenseFn,
  getMyExpensesFn,
  myExpensesQueryKey,
  submitExpenseFn,
  updateExpenseFn,
} from "../api/expensesFn"
import type {
  CreateExpenseRequest,
  ExpenseFilter,
  UpdateExpenseRequest,
} from "../schema/expenseSchema"

export const useMyExpenses = (enabled = true, filters?: ExpenseFilter) => {
  return useQuery({
    queryKey: [...myExpensesQueryKey, filters ?? {}],
    queryFn: () => getMyExpensesFn(filters),
    staleTime: 60_000,
    enabled,
  })
}

export const useCreateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateExpenseRequest) => createExpenseFn(payload),
    onSuccess: () => invalidateExpenses(queryClient),
  })
}

export const useUpdateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExpenseRequest }) =>
      updateExpenseFn(id, payload),
    onSuccess: () => invalidateExpenses(queryClient),
  })
}

export const useSubmitExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => submitExpenseFn(id),
    onSuccess: () => invalidateExpenses(queryClient),
  })
}

export const useDeleteExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteExpenseFn(id),
    onSuccess: () => invalidateExpenses(queryClient),
  })
}

async function invalidateExpenses(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: ["expenses"] })
}
