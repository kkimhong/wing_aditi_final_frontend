import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  createDepartmentFn,
  departmentFn,
  departmentQueryKey,
  updateDepartmentFn,
} from "../api/departmentFn"
import type { DepartmentRequest } from "../schema/departmentSchema"

export const useDepartment = () => {
  return useQuery({
    queryKey: departmentQueryKey,
    queryFn: departmentFn,
    staleTime: 60_000,
  })
}

export const useCreateDepartment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: DepartmentRequest) => createDepartmentFn(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: departmentQueryKey })
    },
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: departmentQueryKey })
    },
  })
}
