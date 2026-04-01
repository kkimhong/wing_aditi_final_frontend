"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { AccessDenied } from "@/components/access-denied"
import { Building2, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/authStore"
import { ACCESS_RULES, hasAnyPermission } from "@/lib/rbac"

const settingsItems = [
  {
    title: "Departments",
    description: "Manage departments and budget limits",
    href: "/settings/departments",
    icon: Building2,
    permissions: ACCESS_RULES.viewDepartments,
  },
  {
    title: "Roles & Permissions",
    description: "Manage roles and assign permissions",
    href: "/settings/roles",
    icon: ShieldCheck,
    permissions: ACCESS_RULES.manageRoles,
  },
]

export default function SettingsPage() {
  const { permissions, roleName } = useAuthStore()

  const visibleSettingsItems = settingsItems.filter((item) =>
    hasAnyPermission(roleName, permissions, item.permissions)
  )

  return (
    <DashboardLayout title="Settings">
      {visibleSettingsItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleSettingsItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-start gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium group-hover:text-accent-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <AccessDenied description="You are not allowed to access any settings modules." />
      )}
    </DashboardLayout>
  )
}
