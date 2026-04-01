import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  registerUserFn,
  toggleUserStatusFn,
  userFn,
  userQueryKey,
} from "../api/userFn"
import type {
  RegisterRequest,
  UserResponse,
} from "../schema/userSchema"

export const useUsers = (enabled = true) => {
  return useQuery({
    queryKey: userQueryKey,
    queryFn: userFn,
    staleTime: 60_000,
    enabled,
  })
}

export const useRegisterUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterRequest) => registerUserFn(payload),
    onSuccess: () => invalidateUsers(queryClient),
  })
}

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      user,
      isActive,
    }: {
      user: UserResponse
      isActive: boolean
    }) => toggleUserStatusFn(user, isActive),
    onSuccess: () => invalidateUsers(queryClient),
  })
}

async function invalidateUsers(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: userQueryKey })
}
