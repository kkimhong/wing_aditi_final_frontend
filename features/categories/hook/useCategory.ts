import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  categoryFn,
  categoryQueryKey,
  createCategoryFn,
  deleteCategoryFn,
  updateCategoryFn,
  updateCategoryStatusFn,
} from "../api/categoryFn"
import type {
  CategoryRequest,
  CategoryResponse,
} from "../schema/categorySchema"

export const useCategory = (enabled = true) => {
  return useQuery({
    queryKey: categoryQueryKey,
    queryFn: categoryFn,
    staleTime: 60_000,
    enabled,
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CategoryRequest) => createCategoryFn(payload),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoryRequest }) =>
      updateCategoryFn(id, payload),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      category,
      active,
    }: {
      category: CategoryResponse
      active: boolean
    }) =>
      updateCategoryStatusFn(category.id, active, {
        name: category.name,
        description: category.description,
        limitPerSubmission: category.limitPerSubmission,
      }),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCategoryFn(id),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

async function invalidateCategories(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: categoryQueryKey })
}
