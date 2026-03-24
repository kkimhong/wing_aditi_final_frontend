"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Building2, ShieldCheck } from "lucide-react"
import Link from "next/link"

const settingsItems = [
  {
    title: "Departments",
    description: "Manage departments and budget limits",
    href: "/settings/departments",
    icon: Building2,
  },
  {
    title: "Roles & Permissions",
    description: "Manage roles and assign permissions",
    href: "/settings/roles",
    icon: ShieldCheck,
  },
]

export default function SettingsPage() {
  return (
    <DashboardLayout title="Settings">
      <div className="grid gap-4 md:grid-cols-2">
        {settingsItems.map((item) => (
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
    </DashboardLayout>
  )
}
