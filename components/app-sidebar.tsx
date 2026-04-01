"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Settings2Icon,
  LayoutDashboard,
  CheckCircle,
  CreditCard,
  ReceiptText,
  BarChart3,
  Users,
  Tag,
  WalletCards,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { canManageAllApprovals } from "@/features/approvals/lib/approvalAccess"
import { useApprovalExpenses } from "@/features/approvals/hook/useApproval"
import { ACCESS_RULES, canAccessSettings, hasAnyPermission } from "@/lib/rbac"

interface ProjectItem {
  name: string
  url: string
  icon: React.ReactNode
  permissions: readonly string[]
  badge?: number
  badgeVariant?: "default" | "destructive"
}

interface NavItem {
  title: string
  url: string
  icon: React.ReactNode
  permissions: readonly string[]
  items?: {
    title: string
    url: string
    permissions: readonly string[]
  }[]
}

const allProjects: ProjectItem[] = [
  {
    name: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboard />,
    permissions: [],
  },
  {
    name: "My Expenses",
    url: "/expenses",
    icon: <CreditCard />,
    permissions: ACCESS_RULES.viewMyExpenses,
  },
  {
    name: "Approval",
    url: "/approval",
    icon: <CheckCircle />,
    permissions: ACCESS_RULES.viewApprovals,
  },
  {
    name: "All Expenses",
    url: "/all-expenses",
    icon: <ReceiptText />,
    permissions: ACCESS_RULES.viewAllExpenses,
  },
  {
    name: "Reports",
    url: "/reports",
    icon: <BarChart3 />,
    permissions: ACCESS_RULES.viewReports,
  },
  {
    name: "Users",
    url: "/users",
    icon: <Users />,
    permissions: ACCESS_RULES.viewUsers,
  },
  {
    name: "Categories",
    url: "/categories",
    icon: <Tag />,
    permissions: ACCESS_RULES.viewCategories,
  },
]

const allNavMain: NavItem[] = [
  {
    title: "Settings",
    url: "/settings",
    icon: <Settings2Icon />,
    permissions: [...ACCESS_RULES.manageRoles, ...ACCESS_RULES.viewDepartments],
    items: [
      {
        title: "Roles & Permissions",
        url: "/settings/roles",
        permissions: ACCESS_RULES.manageRoles,
      },
      {
        title: "Departments",
        url: "/settings/departments",
        permissions: ACCESS_RULES.viewDepartments,
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { email, permissions, roleName } = useAuthStore()

  const can = React.useCallback(
    (requiredPermissions: readonly string[]) =>
      hasAnyPermission(roleName, permissions, requiredPermissions),
    [permissions, roleName]
  )

  const canManageAll = React.useMemo(
    () => canManageAllApprovals(roleName, permissions),
    [permissions, roleName]
  )

  const canViewApprovals = can(ACCESS_RULES.viewApprovals)

  const { data: approvalExpenses } = useApprovalExpenses(
    canViewApprovals,
    canManageAll
  )

  const pendingApprovalsCount = React.useMemo(() => {
    const rows = approvalExpenses ?? []
    return rows.filter((expense) => expense.status === "SUBMITTED").length
  }, [approvalExpenses])

  const projectsWithBadge = React.useMemo<ProjectItem[]>(
    () =>
      allProjects.map((project) =>
        project.url === "/approval"
          ? {
              ...project,
              badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
              badgeVariant: "destructive" as const,
            }
          : project
      ),
    [pendingApprovalsCount]
  )

  const visibleProjects = React.useMemo(
    () => projectsWithBadge.filter((project) => can(project.permissions)),
    [can, projectsWithBadge]
  )

  const visibleNavMain = React.useMemo(
    () =>
      allNavMain
        .filter((item) => {
          if (item.url === "/settings") {
            return canAccessSettings(roleName, permissions)
          }

          return can(item.permissions)
        })
        .map((item) => ({
          ...item,
          items: item.items?.filter((subItem) => can(subItem.permissions)),
        }))
        .filter((item) => !item.items || item.items.length > 0),
    [can, permissions, roleName]
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <WalletCards className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold">ExpenseTracker</span>
            <span className="text-xs text-muted-foreground">
              Company Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavProjects projects={visibleProjects} />
        <NavMain items={visibleNavMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: email ?? "User",
            email: email ?? "",
            avatar: "",
          }}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
