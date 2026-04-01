"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AccessDenied } from "@/components/access-denied"
import { UserTable } from "./UserTable"
import { RegisterUserForm } from "./RegisterUserForm"
import type { RegisterRequest, UserResponse } from "../schema/userSchema"
import { useUsers, useRegisterUser, useToggleUserStatus } from "../hook/useUser"
import { useDepartment } from "@/features/departments/hook/useDepartment"
import { useRoles } from "@/features/roles/hook/useRole"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { ACCESS_RULES, hasAnyPermission } from "@/lib/rbac"

type UserStatusFilter = "ALL" | "ACTIVE" | "INACTIVE"

export function UsersPage() {
  const { permissions, roleName } = useAuthStore()
  const canViewPage = hasAnyPermission(roleName, permissions, ACCESS_RULES.viewUsers)
  const canCreateUser = hasAnyPermission(roleName, permissions, ACCESS_RULES.createUsers)
  const canUpdateUsers = hasAnyPermission(roleName, permissions, ACCESS_RULES.updateUsers)

  const { data: fetchedUsers, isLoading, error } = useUsers(canViewPage)
  const { data: fetchedDepartments, error: departmentsError } = useDepartment(canViewPage)
  const { data: fetchedRoles, error: rolesError } = useRoles(canViewPage)
  const registerUserMutation = useRegisterUser()
  const toggleUserStatusMutation = useToggleUserStatus()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("ALL")
  const [departmentFilter, setDepartmentFilter] = useState("ALL")
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const roleOptions = useMemo(() => {
    return (fetchedRoles ?? []).map((role) => ({ id: role.id, name: role.name }))
  }, [fetchedRoles])

  const departmentOptions = useMemo(() => {
    return (fetchedDepartments ?? []).map((department) => ({
      id: department.id,
      name: department.name,
    }))
  }, [fetchedDepartments])

  const roleNameById = useMemo(() => {
    return new Map(roleOptions.map((role) => [role.id, role.name]))
  }, [roleOptions])

  const departmentNameById = useMemo(() => {
    return new Map(departmentOptions.map((department) => [department.id, department.name]))
  }, [departmentOptions])

  const users = useMemo(() => {
    return (fetchedUsers ?? []).map((user) => ({
      ...user,
      roleName:
        user.roleName ??
        (user.roleId ? roleNameById.get(user.roleId) ?? null : null),
      departmentName:
        user.departmentName ??
        (user.departmentId
          ? departmentNameById.get(user.departmentId) ?? null
          : null),
    }))
  }, [departmentNameById, fetchedUsers, roleNameById])

  const departmentFilters = useMemo(() => {
    const values = new Set(
      users
        .map((user) => user.departmentName)
        .filter((department): department is string => Boolean(department))
    )

    return Array.from(values).sort()
  }, [users])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const term = searchQuery.trim().toLowerCase()
      const matchesSearch =
        term.length === 0 ||
        `${user.firstname} ${user.lastname}`.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.roleName ?? "").toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" ? user.isActive : !user.isActive)

      const matchesDepartment =
        departmentFilter === "ALL" || user.departmentName === departmentFilter

      return matchesSearch && matchesStatus && matchesDepartment
    })
  }, [departmentFilter, searchQuery, statusFilter, users])

  const totalActive = users.filter((user) => user.isActive).length
  const totalInactive = users.length - totalActive
  const totalManagers = users.filter((user) => {
    const role = user.roleName?.trim().toLowerCase() ?? ""
    return role === "manager"
  }).length

  const mutationErrorMessage =
    (registerUserMutation.error as Error | null)?.message ??
    (toggleUserStatusMutation.error as Error | null)?.message ??
    null

  const handleRegister = async (data: RegisterRequest) => {
    if (!canCreateUser) {
      return
    }

    registerUserMutation.reset()

    try {
      await registerUserMutation.mutateAsync(data)
      setSheetOpen(false)
    } catch {
      // Mutation errors are surfaced from react-query state
    }
  }

  const handleToggleStatus = async (target: UserResponse) => {
    if (!canUpdateUsers) {
      return
    }

    toggleUserStatusMutation.reset()
    setUpdatingUserId(target.id)

    try {
      await toggleUserStatusMutation.mutateAsync({
        user: target,
        isActive: !target.isActive,
      })
    } catch {
      // Mutation errors are surfaced from react-query state
    } finally {
      setUpdatingUserId(null)
    }
  }

  if (!canViewPage) {
    return (
      <DashboardLayout title="Users">
        <AccessDenied description="You are not allowed to view user management." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Users"
      actions={
        canCreateUser ? (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Register User
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-2xl lg:max-w-3xl">
              <SheetHeader>
                <SheetTitle>Register user</SheetTitle>
                <SheetDescription>
                  Create a user and assign a role and department.
                </SheetDescription>
              </SheetHeader>
              <div className="overflow-y-auto px-4 pb-4">
                <RegisterUserForm
                  onSubmit={handleRegister}
                  isLoading={registerUserMutation.isPending}
                  departments={departmentOptions}
                  roles={roleOptions}
                />
                {departmentsError ? (
                  <p className="mt-3 text-xs text-destructive">
                    Failed to load departments: {departmentsError.message}
                  </p>
                ) : null}
                {rolesError ? (
                  <p className="mt-1 text-xs text-destructive">
                    Failed to load roles: {rolesError.message}
                  </p>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        ) : null
      }
    >
      <section className="rounded-none border bg-gradient-to-r from-indigo-50 via-white to-cyan-50 p-5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Workforce directory
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          Manage employees, roles, and account statuses
        </h2>
      </section>

      {isLoading && users.length === 0 ? (
        <div className="rounded-none border bg-card p-4 text-sm text-muted-foreground">
          Loading users...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-none border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load users: {error.message}
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
            <CardTitle className="text-xs text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{users.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-none stats-card">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalActive}</p>
            <p className="text-xs text-muted-foreground">{totalInactive} inactive</p>
          </CardContent>
        </Card>

        <Card className="rounded-none stats-card">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">Managers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalManagers}</p>
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-3 rounded-none border bg-card p-4 md:flex-row md:items-end">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or role"
            className="pl-8"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="w-full md:w-[170px]">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as UserStatusFilter)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-[200px]">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All departments</SelectItem>
              {departmentFilters.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground md:ml-auto">
          {filteredUsers.length} user{filteredUsers.length === 1 ? "" : "s"}
        </p>
      </section>

      <UserTable
        users={filteredUsers}
        onToggleStatus={canUpdateUsers ? handleToggleStatus : undefined}
        emptyMessage={
          updatingUserId ? "Updating user status..." : "No users match your filters."
        }
      />
    </DashboardLayout>
  )
}
