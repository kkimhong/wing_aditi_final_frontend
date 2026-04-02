import { useAuthStore } from "@/store/authStore"
import { PERMISSIONS } from "@/types/common"
import type { PermissionKey } from "@/types/common"

export function usePermission() {
  const hasPermission = useAuthStore((s) => s.hasPermission)

  return {
    can: (permission: PermissionKey) => hasPermission(permission),
    canAny: (permissions: PermissionKey[]) => permissions.some(hasPermission),
    canAll: (permissions: PermissionKey[]) => permissions.every(hasPermission),
    PERMISSIONS,
  }
}
