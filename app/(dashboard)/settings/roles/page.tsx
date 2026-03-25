"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RoleForm } from "@/features/roles/components/RoleForm"
import { RoleTable } from "@/features/roles/components/RoleTable"
import { RolePermissionsSheet } from "@/features/roles/components/RolePermissionsSheet"
import type {
  AssignPermissionsRequest,
  PermissionResponse,
  RoleRequest,
  RoleResponse,
} from "@/features/roles/schema/roleSchema"
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

type RoleWithPermissions = Omit<RoleResponse, "permissionCount"> & {
  permissionIds: string[]
}

const permissionCatalog: PermissionResponse[] = [
  { id: "a1f5b4a0-9788-4f8e-8f81-b1b4cb35f301", module: "Expenses", action: "create" },
  { id: "f380f84b-cc6e-4df8-bcef-d33ed42fe649", module: "Expenses", action: "read_own" },
  { id: "2cf240e4-0a5d-4fef-90f8-e7671896da63", module: "Expenses", action: "read_all" },
  { id: "c60be2e1-c7cb-404a-a523-5ec38ec9f4f8", module: "Expenses", action: "submit" },
  { id: "56785fb6-4377-4aaf-a7f3-f31ecf67f822", module: "Approvals", action: "approve" },
  { id: "4214a6c4-f43a-4094-bf34-249fcb8df4f3", module: "Approvals", action: "reject" },
  { id: "e2d4c2a4-cb80-4472-802c-a65aa3ebffe9", module: "Reports", action: "read" },
  { id: "5fd74c20-bfc3-4c35-9cc5-c50f229f6144", module: "Reports", action: "export" },
  { id: "7b7bb353-b1fc-4c89-8080-51578b1d136b", module: "Users", action: "create" },
  { id: "2ec6283d-9858-475d-9ef9-39f1ef95ad8a", module: "Users", action: "read" },
  { id: "58fe8cd8-8f4b-4aeb-90a3-13a64becf97e", module: "Users", action: "update" },
  { id: "b72307cd-95cb-40d7-a3cc-e3822d66fef5", module: "Categories", action: "create" },
  { id: "c3588eaf-c7f8-419f-bd7e-b3fdbe128fa1", module: "Categories", action: "read" },
  { id: "cfa31f23-2f7c-4642-8657-365477006fda", module: "Categories", action: "update" },
  { id: "dc3ee586-269f-4734-95ac-72f7a3cbd6f2", module: "Departments", action: "create" },
  { id: "d49880dc-ff4f-46e5-8542-9d9ac0c8c328", module: "Departments", action: "read" },
  { id: "8b0223e3-0472-47dc-b1a7-d89fb58d32d0", module: "Departments", action: "update" },
  { id: "9ec97ded-300f-44e7-b55a-4762de658c4a", module: "Settings", action: "manage_roles" },
]

const initialRoles: RoleWithPermissions[] = [
  {
    id: "18166f92-ac8f-47f2-b8d9-f9ff4e6ca263",
    name: "Administrator",
    description: "Full system access across all modules",
    priority: 100,
    permissionIds: permissionCatalog.map((permission) => permission.id),
  },
  {
    id: "9a7f8948-4602-4a43-bd49-204f2f94b4f7",
    name: "Manager",
    description: "Can review team expenses and approvals",
    priority: 70,
    permissionIds: pickPermissions([
      ["Expenses", "create"],
      ["Expenses", "read_own"],
      ["Expenses", "read_all"],
      ["Expenses", "submit"],
      ["Approvals", "approve"],
      ["Approvals", "reject"],
      ["Reports", "read"],
    ]),
  },
  {
    id: "80bc0f5d-d6ef-4304-ba59-f0de830f6f30",
    name: "Employee",
    description: "Can create and submit own expenses",
    priority: 30,
    permissionIds: pickPermissions([
      ["Expenses", "create"],
      ["Expenses", "read_own"],
      ["Expenses", "submit"],
      ["Reports", "read"],
    ]),
  },
]

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleWithPermissions[]>(initialRoles)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [permissionSheetOpen, setPermissionSheetOpen] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [managingRoleId, setManagingRoleId] = useState<string | null>(null)

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
      permissionCount: role.permissionIds.length,
    }))
  }, [filteredRoles])

  const editingRole = roles.find((role) => role.id === editingRoleId) ?? null
  const managingRole = roles.find((role) => role.id === managingRoleId) ?? null

  const totalAssignedPermissions = roles.reduce(
    (total, role) => total + role.permissionIds.length,
    0
  )

  const uniqueUsedPermissions = new Set(
    roles.flatMap((role) => role.permissionIds)
  ).size

  const handleSaveRole = (data: RoleRequest) => {
    if (editingRoleId) {
      setRoles((current) =>
        current.map((role) =>
          role.id === editingRoleId
            ? {
                ...role,
                name: data.name,
                description: data.description ?? null,
                priority: data.priority,
              }
            : role
        )
      )
    } else {
      const nextRole: RoleWithPermissions = {
        id: createId(),
        name: data.name,
        description: data.description ?? null,
        priority: data.priority,
        permissionIds: [],
      }

      setRoles((current) => [nextRole, ...current])
    }

    setRoleDialogOpen(false)
    setEditingRoleId(null)
  }

  const handleAssignPermissions = (data: AssignPermissionsRequest) => {
    if (!managingRoleId) return

    setRoles((current) =>
      current.map((role) =>
        role.id === managingRoleId
          ? { ...role, permissionIds: data.permissionIds }
          : role
      )
    )

    setPermissionSheetOpen(false)
    setManagingRoleId(null)
  }

  const handleDeleteRole = (role: RoleResponse) => {
    if (role.name === "Administrator") {
      return
    }

    setRoles((current) => current.filter((item) => item.id !== role.id))
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
          setRoleDialogOpen(true)
        }}
        onManagePermissions={(role) => {
          setManagingRoleId(role.id)
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
          }
        }}
        roleName={managingRole?.name}
        permissions={permissionCatalog}
        currentPermissionIds={managingRole?.permissionIds ?? []}
        onSubmit={handleAssignPermissions}
      />
    </DashboardLayout>
  )
}

function pickPermissions(keys: Array<[string, string]>) {
  const ids = keys
    .map(([module, action]) => {
      return permissionCatalog.find(
        (permission) => permission.module === module && permission.action === action
      )?.id
    })
    .filter((id): id is string => Boolean(id))

  return ids
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

