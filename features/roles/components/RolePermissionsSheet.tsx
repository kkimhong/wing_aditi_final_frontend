"use client"

import { AssignPermissionsForm } from "./AssignPermissionsForm"
import type {
  AssignPermissionsRequest,
  PermissionResponse,
} from "../schema/roleSchema"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface RolePermissionsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleName?: string
  permissions: PermissionResponse[]
  currentPermissionIds?: string[]
  onSubmit: (data: AssignPermissionsRequest) => void
  isLoading?: boolean
}

export function RolePermissionsSheet({
  open,
  onOpenChange,
  roleName,
  permissions,
  currentPermissionIds,
  onSubmit,
  isLoading,
}: RolePermissionsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Manage Permissions</SheetTitle>
          <SheetDescription>
            {roleName
              ? `Assign what ${roleName} can access and perform.`
              : "Assign role permissions."}
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 pt-0">
          <AssignPermissionsForm
            permissions={permissions}
            currentPermissionIds={currentPermissionIds}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
