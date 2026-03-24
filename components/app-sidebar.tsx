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
  Building2,
  ShieldCheck,
  WalletCards,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"

// ── Types ──────────────────────────────────────────────────
interface ProjectItem {
  name: string
  url: string
  icon: React.ReactNode
  permission: string | null
}

interface NavItem {
  title: string
  url: string
  icon: React.ReactNode
  permission: string | null
  items?: {
    title: string
    url: string
    permission: string | null
  }[]
}

// ── All items with permissions ─────────────────────────────
const allProjects: ProjectItem[] = [
  {
    name: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboard />,
    permission: null,
  },
  {
    name: "My Expenses",
    url: "/expenses",
    icon: <CreditCard />,
    permission: null,
  },
  {
    name: "Approval",
    url: "/approval",
    icon: <CheckCircle />,
    permission: null,
  },
  {
    name: "All Expenses",
    url: "/all-expenses",
    icon: <ReceiptText />,
    permission: null,
  },
  {
    name: "Reports",
    url: "/reports",
    icon: <BarChart3 />,
    permission: null,
  },
  {
    name: "Users",
    url: "/users",
    icon: <Users />,
    permission: null,
  },
  {
    name: "Categories",
    url: "/categories",
    icon: <Tag />,
    permission: null,
  },
]

const allNavMain: NavItem[] = [
  {
    title: "Settings",
    url: "/settings",
    icon: <Settings2Icon />,
    permission: null,
    items: [
      {
        title: "Roles & Permissions",
        url: "/settings/roles",
        permission: null,
      },
      {
        title: "Departments",
        url: "/settings/departments",
        permission: null,
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { email, permissions } = useAuthStore()

  // ── Permission filter helper ───────────────────────────
  const can = (permission: string | null) => {
    if (permission === null) return true
    return permissions.includes(permission)
  }

  // ── Filter items based on permissions ─────────────────
  const visibleProjects = allProjects.filter((p) => can(p.permission))

  const visibleNavMain = allNavMain
    .filter((item) => can(item.permission))
    .map((item) => ({
      ...item,
      items: item.items?.filter((sub) => can(sub.permission)),
    }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* Company branding */}
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
