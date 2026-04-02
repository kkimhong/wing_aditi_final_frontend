"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AccessDenied } from "@/components/access-denied"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AssignPermissionsForm } from "@/features/roles/components/AssignPermissionsForm"
import type {
  AssignPermissionsRequest,
  PermissionResponse,
} from "@/features/roles/schema/roleSchema"
import {
  useAssignRolePermissions,
  useRolePermissionsCatalog,
  useRoles,
} from "@/features/roles/hook/useRole"
import { usePermission } from "@/hooks/usePermission"
import { PERMISSIONS } from "@/types/common"

export default function RolePermissionsPage() {
  const params = useParams<{ roleId: string }>()
  const roleIdParam = params?.roleId
  const roleId = typeof roleIdParam === "string" ? decodeURIComponent(roleIdParam) : ""

  const { can } = usePermission()
  const canView = can(PERMISSIONS.ROLES_READ)
  const canUpdate = can(PERMISSIONS.ROLES_UPDATE)

  const {
    data: roles = [],
    isLoading: isLoadingRoles,
    error: rolesError,
  } = useRoles(canView)
  const {
    data: fetchedPermissions = [],
    error: permissionsError,
  } = useRolePermissionsCatalog(canView)

  const assignPermissionsMutation = useAssignRolePermissions()
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  const role = roles.find((item) => item.id === roleId) ?? null
  const currentPermissionIds = useMemo(() => {
    if (!role) {
      return []
    }

    if (Array.isArray(role.permissionIds) && role.permissionIds.length > 0) {
      return role.permissionIds
    }

    return role.permissions.map((permission) => permission.id)
  }, [role])

  const permissionCatalog = useMemo<PermissionResponse[]>(() => {
    if (Array.isArray(fetchedPermissions) && fetchedPermissions.length > 0) {
      return fetchedPermissions
    }

    const knownPermissionKeys = Object.values(PERMISSIONS)
    return buildPermissionCatalog([...knownPermissionKeys, ...currentPermissionIds])
  }, [currentPermissionIds, fetchedPermissions])

  const mutationError = (assignPermissionsMutation.error as Error | null)?.message ?? null

  const handleSavePermissions = async (data: AssignPermissionsRequest) => {
    if (!roleId || !canUpdate) {
      return
    }

    setSavedMessage(null)
    assignPermissionsMutation.reset()

    try {
      await assignPermissionsMutation.mutateAsync({
        roleId,
        payload: data,
      })

      setSavedMessage("Permissions updated successfully.")
    } catch {
      // surfaced by mutation state
    }
  }

  if (!canView || !canUpdate) {
    return (
      <DashboardLayout title="Role Permissions">
        <AccessDenied description="You are not allowed to assign role permissions." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Role Permissions"
      actions={
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings/roles" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Roles
          </Link>
        </Button>
      }
    >
      <section className="rounded-none border bg-gradient-to-r from-emerald-50 via-white to-cyan-50 p-5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Permission assignment
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          {role ? `Manage permissions for ${role.name}` : "Manage role permissions"}
        </h2>
      </section>

      {isLoadingRoles ? (
        <div className="rounded-none border bg-card p-4 text-sm text-muted-foreground">
          Loading role data...
        </div>
      ) : null}

      {rolesError ? (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load roles: {rolesError.message}
        </div>
      ) : null}

      {permissionsError && fetchedPermissions.length === 0 ? (
        <div className="rounded-none border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          Could not load permission catalog from backend. Showing known permission keys.
        </div>
      ) : null}

      {mutationError ? (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {mutationError}
        </div>
      ) : null}

      {savedMessage ? (
        <div className="rounded-none border border-emerald-300/60 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
          {savedMessage}
        </div>
      ) : null}

      {!isLoadingRoles && !role ? (
        <div className="rounded-none border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          Role not found. It may have been removed.
        </div>
      ) : null}

      {role ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <AssignPermissionsForm
                permissions={permissionCatalog}
                currentPermissionIds={currentPermissionIds}
                onSubmit={handleSavePermissions}
                isLoading={assignPermissionsMutation.isPending}
              />
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader>
              <CardTitle>Role Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{role.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Priority</p>
                <p className="font-medium">{role.priority}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Assigned Users</p>
                <p className="font-medium">{role.userCount ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Selected Permissions</p>
                <p className="font-medium">{currentPermissionIds.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </DashboardLayout>
  )
}

function buildPermissionCatalog(keys: string[]): PermissionResponse[] {
  const uniqueKeys = Array.from(new Set(keys.map((key) => key.trim()).filter(Boolean)))

  return uniqueKeys
    .map(toPermissionResponse)
    .filter((permission): permission is PermissionResponse => permission !== null)
    .sort((a, b) => {
      const moduleCompare = a.module.localeCompare(b.module)
      if (moduleCompare !== 0) {
        return moduleCompare
      }

      return a.action.localeCompare(b.action)
    })
}

function toPermissionResponse(key: string): PermissionResponse | null {
  if (!key) {
    return null
  }

  const [rawModule, rawAction] = key.split(":")
  const moduleName = normalizeLabel(rawModule || "general")
  const actionName = normalizeActionLabel(rawAction || rawModule || key)

  return {
    id: key,
    module: moduleName,
    action: actionName,
    key,
  }
}

function normalizeLabel(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((chunk) => chunk[0].toUpperCase() + chunk.slice(1).toLowerCase())
    .join(" ")
}

function normalizeActionLabel(value: string) {
  return value.trim().toLowerCase()
}
