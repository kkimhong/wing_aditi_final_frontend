import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  createDepartmentFn,
  deleteDepartmentFn,
  departmentFn,
  departmentQueryKey,
  updateDepartmentFn,
} from "../api/departmentFn"
import type { DepartmentRequest } from "../schema/departmentSchema"

export const useDepartment = (enabled = true) => {
  return useQuery({
    queryKey: departmentQueryKey,
    queryFn: departmentFn,
    staleTime: 60_000,
    enabled,
  })
}

export const useCreateDepartment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: DepartmentRequest) => createDepartmentFn(payload),
    onSuccess: () => invalidateDepartments(queryClient),
  })
}

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: DepartmentRequest
    }) => updateDepartmentFn(id, payload),
    onSuccess: () => invalidateDepartments(queryClient),
  })
}

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDepartmentFn(id),
    onSuccess: () => invalidateDepartments(queryClient),
  })
}

async function invalidateDepartments(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: departmentQueryKey })
}
