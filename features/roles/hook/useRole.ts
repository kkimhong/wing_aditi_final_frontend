import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  assignRolePermissionsFn,
  createRoleFn,
  deleteRoleFn,
  getAllPermissionsFn,
  getRolesFn,
  permissionQueryKey,
  rolePermissionQueryKey,
  roleQueryKey,
  updateRoleFn,
} from "../api/roleFn"
import type {
  AssignPermissionsRequest,
  RoleRequest,
} from "../schema/roleSchema"

export const useRoles = (enabled = true) => {
  return useQuery({
    queryKey: roleQueryKey,
    queryFn: getRolesFn,
    staleTime: 60_000,
    enabled,
  })
}

export const useAllPermissions = (enabled = true) => {
  return useQuery({
    queryKey: permissionQueryKey,
    queryFn: getAllPermissionsFn,
    staleTime: 60_000,
    enabled,
  })
}

export const useRolePermissionsCatalog = useAllPermissions

export const useCreateRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RoleRequest) => createRoleFn(payload),
    onSuccess: () => invalidateRoles(queryClient),
  })
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RoleRequest }) =>
      updateRoleFn(id, payload),
    onSuccess: () => invalidateRoles(queryClient),
  })
}

export const useDeleteRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRoleFn(id),
    onSuccess: () => invalidateRoles(queryClient),
  })
}

export const useAssignRolePermissions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: {
      roleId: string
      payload: AssignPermissionsRequest
    }) => assignRolePermissionsFn(roleId, payload),
    onSuccess: () => invalidateRoles(queryClient),
  })
}

async function invalidateRoles(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: roleQueryKey }),
    queryClient.invalidateQueries({ queryKey: rolePermissionQueryKey }),
  ])
}
