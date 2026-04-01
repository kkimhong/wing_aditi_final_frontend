"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AccessDenied } from "@/components/access-denied"
import { RoleForm } from "@/features/roles/components/RoleForm"
import { RoleTable } from "@/features/roles/components/RoleTable"
import { RolePermissionsSheet } from "@/features/roles/components/RolePermissionsSheet"
import type {
  AssignPermissionsRequest,
  PermissionResponse,
  RoleRequest,
  RoleResponse,
} from "@/features/roles/schema/roleSchema"
import {
  useAssignRolePermissions,
  useCreateRole,
  useDeleteRole,
  useRolePermissionsCatalog,
  useRoles,
  useUpdateRole,
} from "@/features/roles/hook/useRole"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Search } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { ACCESS_RULES, hasAnyPermission, PERMISSIONS } from "@/lib/rbac"

interface RoleWithPermissions extends RoleResponse {
  permissionIds: string[]
}

export default function RolesPage() {
  const { permissions, roleName } = useAuthStore()
  const canManageRoles = hasAnyPermission(
    roleName,
    permissions,
    ACCESS_RULES.manageRoles
  )

  const {
    data: fetchedRoles,
    isLoading: isLoadingRoles,
    error: rolesError,
  } = useRoles(canManageRoles)
  const {
    data: fetchedPermissionCatalog,
    isLoading: isLoadingPermissions,
    error: permissionsError,
  } = useRolePermissionsCatalog(canManageRoles)

  const createRoleMutation = useCreateRole()
  const updateRoleMutation = useUpdateRole()
  const deleteRoleMutation = useDeleteRole()
  const assignPermissionsMutation = useAssignRolePermissions()

  const [searchQuery, setSearchQuery] = useState("")
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [permissionSheetOpen, setPermissionSheetOpen] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [managingRoleId, setManagingRoleId] = useState<string | null>(null)

  const roles: RoleWithPermissions[] = useMemo(() => {
    return (fetchedRoles ?? []).map((role) => ({
      ...role,
      permissionIds: Array.isArray(role.permissionIds) ? role.permissionIds : [],
    }))
  }, [fetchedRoles])

  const permissionCatalog = useMemo<PermissionResponse[]>(() => {
    if (Array.isArray(fetchedPermissionCatalog) && fetchedPermissionCatalog.length > 0) {
      return fetchedPermissionCatalog
    }

    const rolePermissionIds = roles.flatMap((role) => role.permissionIds)
    const knownPermissions = Object.values(PERMISSIONS)

    return buildPermissionCatalog([...rolePermissionIds, ...knownPermissions])
  }, [fetchedPermissionCatalog, roles])

  const filteredRoles = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()

    const nextRoles = roles
      .filter((role) => {
        if (!term) return true

        return (
          role.name.toLowerCase().includes(term) ||
          (role.description ?? "").toLowerCase().includes(term)
        )
      })
      .sort((a, b) => b.priority - a.priority)

    return nextRoles
  }, [roles, searchQuery])

  const roleRows: RoleResponse[] = useMemo(() => {
    return filteredRoles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      priority: role.priority,
      permissionCount:
        role.permissionIds.length > 0 ? role.permissionIds.length : role.permissionCount,
    }))
  }, [filteredRoles])

  const editingRole = roles.find((role) => role.id === editingRoleId) ?? null
  const managingRole = roles.find((role) => role.id === managingRoleId) ?? null

  const totalAssignedPermissions = roles.reduce(
    (total, role) =>
      total + (role.permissionIds.length > 0 ? role.permissionIds.length : role.permissionCount),
    0
  )

  const uniqueUsedPermissions = new Set(
    roles.flatMap((role) => role.permissionIds)
  ).size

  const resetMutations = () => {
    createRoleMutation.reset()
    updateRoleMutation.reset()
    deleteRoleMutation.reset()
    assignPermissionsMutation.reset()
  }

  const handleSaveRole = async (data: RoleRequest) => {
    resetMutations()

    try {
      if (editingRoleId) {
        await updateRoleMutation.mutateAsync({ id: editingRoleId, payload: data })
      } else {
        await createRoleMutation.mutateAsync(data)
      }

      setRoleDialogOpen(false)
      setEditingRoleId(null)
    } catch {
      // Mutation errors are surfaced from react-query state
    }
  }

  const handleAssignPermissions = async (data: AssignPermissionsRequest) => {
    if (!managingRoleId) return

    resetMutations()

    try {
      await assignPermissionsMutation.mutateAsync({
        roleId: managingRoleId,
        payload: data,
      })

      setPermissionSheetOpen(false)
      setManagingRoleId(null)
    } catch {
      // Mutation errors are surfaced from react-query state
    }
  }

  const handleDeleteRole = async (role: RoleResponse) => {
    if (role.name.toLowerCase() === "administrator") {
      return
    }

    resetMutations()

    try {
      await deleteRoleMutation.mutateAsync(role.id)
    } catch {
      // Mutation errors are surfaced from react-query state
    }
  }

  const mutationErrorMessage =
    (createRoleMutation.error as Error | null)?.message ??
    (updateRoleMutation.error as Error | null)?.message ??
    (deleteRoleMutation.error as Error | null)?.message ??
    (assignPermissionsMutation.error as Error | null)?.message ??
    null

  if (!canManageRoles) {
    return (
      <DashboardLayout title="Roles & Permissions">
        <AccessDenied description="You are not allowed to manage roles and permissions." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Roles & Permissions"
      actions={
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => {
            setEditingRoleId(null)
            resetMutations()
            setRoleDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      }
    >
      <section className="rounded-none border bg-gradient-to-r from-amber-50 via-white to-emerald-50 p-5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Access control
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          Define what each role can view, create, approve, or manage
        </h2>
      </section>

      {isLoadingRoles ? (
        <div className="rounded-none border bg-card p-4 text-sm text-muted-foreground">
          Loading roles...
        </div>
      ) : null}

      {rolesError ? (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load roles: {rolesError.message}
        </div>
      ) : null}

      {permissionsError && permissionCatalog.length === 0 ? (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load permissions: {permissionsError.message}
        </div>
      ) : null}

      {mutationErrorMessage ? (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {mutationErrorMessage}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="rounded-none stats-card">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{roles.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-none stats-card">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">Permissions Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{permissionCatalog.length}</p>
            {isLoadingPermissions ? (
              <p className="text-xs text-muted-foreground">Loading permissions...</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-none stats-card">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">Assigned Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalAssignedPermissions}</p>
            <p className="text-xs text-muted-foreground">
              {uniqueUsedPermissions} unique permissions in use
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-3 rounded-none border bg-card p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search roles by name or description"
            className="pl-8"
          />
        </div>
        <p className="text-xs text-muted-foreground md:ml-auto">
          {roleRows.length} role{roleRows.length === 1 ? "" : "s"}
        </p>
      </section>

      <RoleTable
        roles={roleRows}
        onEdit={(role) => {
          setEditingRoleId(role.id)
          resetMutations()
          setRoleDialogOpen(true)
        }}
        onManagePermissions={(role) => {
          setManagingRoleId(role.id)
          resetMutations()
          setPermissionSheetOpen(true)
        }}
        onDelete={handleDeleteRole}
      />

      <Dialog
        open={roleDialogOpen}
        onOpenChange={(open) => {
          setRoleDialogOpen(open)
          if (!open) {
            setEditingRoleId(null)
            resetMutations()
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Create Role"}</DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Update role details and priority."
                : "Create a new role, then assign its permissions."}
            </DialogDescription>
          </DialogHeader>

          <RoleForm
            onSubmit={handleSaveRole}
            isLoading={createRoleMutation.isPending || updateRoleMutation.isPending}
            defaultValues={
              editingRole
                ? {
                    name: editingRole.name,
                    description: editingRole.description,
                    priority: editingRole.priority,
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>

      <RolePermissionsSheet
        open={permissionSheetOpen}
        onOpenChange={(open) => {
          setPermissionSheetOpen(open)
          if (!open) {
            setManagingRoleId(null)
            resetMutations()
          }
        }}
        roleName={managingRole?.name}
        permissions={permissionCatalog}
        currentPermissionIds={managingRole?.permissionIds ?? []}
        onSubmit={handleAssignPermissions}
        isLoading={assignPermissionsMutation.isPending}
      />
    </DashboardLayout>
  )
}

function buildPermissionCatalog(keys: string[]): PermissionResponse[] {
  const uniqueKeys = Array.from(
    new Set(keys.map((key) => key.trim()).filter(Boolean))
  )

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
