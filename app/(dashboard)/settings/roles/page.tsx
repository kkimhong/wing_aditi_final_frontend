"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AccessDenied } from "@/components/access-denied"
import { DeleteRoleDialog } from "@/features/roles/components/DeleteRoleDialog"
import { RoleForm } from "@/features/roles/components/RoleForm"
import { RoleTable } from "@/features/roles/components/RoleTable"
import type {
  RoleRequest,
  RoleResponse,
} from "@/features/roles/schema/roleSchema"
import {
  useCreateRole,
  useDeleteRole,
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
import { usePermission } from "@/hooks/usePermission"
import { PERMISSIONS } from "@/types/common"

export default function RolesPage() {
  const router = useRouter()
  const { can } = usePermission()

  const canView = can(PERMISSIONS.ROLES_READ)
  const canCreate = can(PERMISSIONS.ROLES_CREATE)
  const canUpdate = can(PERMISSIONS.ROLES_UPDATE)
  const canDelete = can(PERMISSIONS.ROLES_DELETE)

  const {
    data: roles = [],
    isLoading: isLoadingRoles,
    error: rolesError,
  } = useRoles(canView)

  const createRoleMutation = useCreateRole()
  const updateRoleMutation = useUpdateRole()
  const deleteRoleMutation = useDeleteRole()

  const [searchQuery, setSearchQuery] = useState("")
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteRoleId, setPendingDeleteRoleId] = useState<string | null>(null)
  const [deleteBlockedReason, setDeleteBlockedReason] = useState<string | null>(null)

  const editingRole = roles.find((r) => r.id === editingRoleId) ?? null
  const pendingDeleteRole = roles.find((r) => r.id === pendingDeleteRoleId) ?? null

  const filteredRoles = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()
    return roles
      .filter(
        (role) =>
          !term ||
          role.name.toLowerCase().includes(term) ||
          (role.description ?? "").toLowerCase().includes(term)
      )
      .sort((a, b) => b.priority - a.priority)
  }, [roles, searchQuery])

  const permissionCatalogSize = Object.values(PERMISSIONS).length

  const totalAssignedPermissions = roles.reduce(
    (sum, role) => sum + (role.permissionCount ?? role.permissions.length),
    0
  )

  const uniquePermissionsInUse = new Set(
    roles.flatMap((role) =>
      role.permissionIds && role.permissionIds.length > 0
        ? role.permissionIds
        : role.permissions.map((permission) => permission.id)
    )
  ).size

  const mutationError =
    (createRoleMutation.error as Error | null)?.message ??
    (updateRoleMutation.error as Error | null)?.message ??
    (deleteRoleMutation.error as Error | null)?.message ??
    null

  const resetMutations = () => {
    createRoleMutation.reset()
    updateRoleMutation.reset()
    deleteRoleMutation.reset()
  }

  const openCreate = () => {
    setEditingRoleId(null)
    resetMutations()
    setRoleDialogOpen(true)
  }

  const openEdit = (role: RoleResponse) => {
    setEditingRoleId(role.id)
    resetMutations()
    setRoleDialogOpen(true)
  }

  const closeRoleDialog = () => {
    setRoleDialogOpen(false)
    setEditingRoleId(null)
    resetMutations()
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setPendingDeleteRoleId(null)
    setDeleteBlockedReason(null)
  }

  const getDeleteBlockedReason = (role: RoleResponse) => {
    const normalizedRoleName = role.name.trim().toLowerCase()
    if (normalizedRoleName === "administrator" || normalizedRoleName === "admin") {
      return "Administrator role is protected and cannot be deleted."
    }

    if ((role.userCount ?? 0) > 0) {
      const count = role.userCount ?? 0
      return `This role has ${count} assigned user${count === 1 ? "" : "s"}. Reassign users first.`
    }

    return null
  }

  const handleSave = async (data: RoleRequest) => {
    resetMutations()
    try {
      if (editingRoleId) {
        await updateRoleMutation.mutateAsync({
          id: editingRoleId,
          payload: data,
        })
      } else {
        await createRoleMutation.mutateAsync(data)
      }
      closeRoleDialog()
    } catch {
      // error surfaced via mutationError
    }
  }

  const requestDelete = (role: RoleResponse) => {
    if (!canDelete) return
    setDeleteBlockedReason(null)
    setPendingDeleteRoleId(role.id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDeleteRole) {
      return
    }

    const blockedReason = getDeleteBlockedReason(pendingDeleteRole)
    if (blockedReason) {
      return
    }

    resetMutations()
    try {
      await deleteRoleMutation.mutateAsync(pendingDeleteRole.id)
      closeDeleteDialog()
    } catch (error) {
      const message = error instanceof Error ? error.message : ""
      if (isRoleLinkedToUsersError(message)) {
        setDeleteBlockedReason(
          "This role is currently assigned to one or more users. Reassign users before deleting this role."
        )
      }
      // error surfaced via mutationError
    }
  }

  if (!canView) {
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
        canCreate ? (
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        ) : null
      }
    >
      <section className="rounded-none border bg-gradient-to-r from-amber-50 via-white to-emerald-50 p-5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Access control
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          Define what each role can view, create, approve, or manage
        </h2>
      </section>

      {isLoadingRoles && (
        <div className="rounded-none border bg-card p-4 text-sm text-muted-foreground">
          Loading roles...
        </div>
      )}

      {rolesError && (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load roles: {rolesError.message}
        </div>
      )}

      {mutationError && (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {mutationError}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">
              Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{roles.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">
              Permissions Catalog
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{permissionCatalogSize}</p>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">
              Assigned Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalAssignedPermissions}</p>
            <p className="text-xs text-muted-foreground">
              {uniquePermissionsInUse} unique in use
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-3 rounded-none border bg-card p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles by name or description"
            className="pl-8"
          />
        </div>
        <p className="text-xs text-muted-foreground md:ml-auto">
          {filteredRoles.length} role{filteredRoles.length === 1 ? "" : "s"}
        </p>
      </section>

      <RoleTable
        roles={filteredRoles}
        onEdit={canUpdate ? openEdit : undefined}
        onManagePermissions={
          canUpdate
            ? (role) => router.push(`/settings/roles/${encodeURIComponent(role.id)}/permissions`)
            : undefined
        }
        onDelete={canDelete ? requestDelete : undefined}
        getDeleteBlockedReason={canDelete ? getDeleteBlockedReason : undefined}
      />

      <Dialog
        open={roleDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeRoleDialog()
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Edit Role" : "Create Role"}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Update role details and priority."
                : "Create a new role, then configure its permissions."}
            </DialogDescription>
          </DialogHeader>

          <RoleForm
            isLoading={
              createRoleMutation.isPending || updateRoleMutation.isPending
            }
            onSubmit={handleSave}
            defaultValues={
              editingRole
                ? {
                    name: editingRole.name,
                    description: editingRole.description,
                    priority: editingRole.priority,
                    permissionIds:
                      editingRole.permissionIds && editingRole.permissionIds.length > 0
                        ? editingRole.permissionIds
                        : editingRole.permissions.map((permission) => permission.id),
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>

      <DeleteRoleDialog
        open={deleteDialogOpen}
        role={pendingDeleteRole}
        blockedReason={deleteBlockedReason ?? (pendingDeleteRole ? getDeleteBlockedReason(pendingDeleteRole) : null)}
        isDeleting={deleteRoleMutation.isPending}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) {
            setPendingDeleteRoleId(null)
            setDeleteBlockedReason(null)
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </DashboardLayout>
  )
}

function isRoleLinkedToUsersError(message: string) {
  const normalized = message.trim().toLowerCase()
  return (
    normalized.includes("assigned user") ||
    normalized.includes("has user") ||
    normalized.includes("in use") ||
    normalized.includes("linked to user")
  )
}
