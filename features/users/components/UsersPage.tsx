"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UserTable } from "./UserTable"
import { RegisterUserForm } from "./RegisterUserForm"
import { mockUsers, departmentOptions, roleOptions } from "./userMockData"
import type { RegisterRequest, UserResponse } from "../schema/userSchema"
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

type UserStatusFilter = "ALL" | "ACTIVE" | "INACTIVE"

export function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>(mockUsers)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("ALL")
  const [departmentFilter, setDepartmentFilter] = useState("ALL")

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
  const totalManagers = users.filter((user) => user.roleName === "Manager").length

  const handleRegister = (data: RegisterRequest) => {
    const roleName = roleOptions.find((role) => role.id === data.roleId)?.name ?? null
    const departmentName =
      departmentOptions.find((department) => department.id === data.departmentId)
        ?.name ?? null

    const nextUser: UserResponse = {
      id: createId(),
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      roleName,
      departmentName,
      isActive: true,
      permissions: [],
      createdAt: new Date().toISOString(),
    }

    setUsers((current) => [nextUser, ...current])
    setSheetOpen(false)
  }

  const handleToggleStatus = (target: UserResponse) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === target.id ? { ...user, isActive: !user.isActive } : user
      )
    )
  }

  return (
    <DashboardLayout
      title="Users"
      actions={
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
                departments={departmentOptions}
                roles={roleOptions}
              />
            </div>
          </SheetContent>
        </Sheet>
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
        onToggleStatus={handleToggleStatus}
        emptyMessage="No users match your filters."
      />
    </DashboardLayout>
  )
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}


