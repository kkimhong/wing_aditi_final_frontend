"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: React.ReactNode
    badge?: number
    badgeVariant?: "default" | "destructive"
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          const isActive = isPathActive(pathname, item.url)
          const badgeLabel =
            item.badge && item.badge > 0
              ? item.badge > 99
                ? "99+"
                : item.badge.toString()
              : null
          const badgeClassName =
            item.badgeVariant === "destructive"
              ? "right-2 min-w-[1.5rem] rounded-full bg-red-600 px-2 text-[11px] leading-none font-semibold text-white dark:bg-red-600 dark:text-white peer-hover/menu-button:text-white peer-data-active/menu-button:text-white"
              : undefined

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className={badgeLabel ? "pr-8" : undefined}
              >
                <Link href={item.url}>
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
              {badgeLabel ? (
                <SidebarMenuBadge className={badgeClassName}>
                  {badgeLabel}
                </SidebarMenuBadge>
              ) : null}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function isPathActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
