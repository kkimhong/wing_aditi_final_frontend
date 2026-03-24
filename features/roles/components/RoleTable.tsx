"use client"

import type { RoleResponse } from "../schema/roleSchema"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, ShieldCheck, Trash2 } from "lucide-react"

interface RoleTableProps {
  roles: RoleResponse[]
  onEdit?: (role: RoleResponse) => void
  onManagePermissions?: (role: RoleResponse) => void
  onDelete?: (role: RoleResponse) => void
}

export function RoleTable({
  roles,
  onEdit,
  onManagePermissions,
  onDelete,
}: RoleTableProps) {
  return (
    <div className="rounded-none border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Priority</TableHead>
            <TableHead className="text-right">Permissions</TableHead>
            <TableHead className="w-[140px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                No roles created yet.
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {role.description ?? "-"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {role.priority}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{role.permissionCount}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit?.(role)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit role</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onManagePermissions?.(role)}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span className="sr-only">Manage permissions</span>
                    </Button>
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(role)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        <span className="sr-only">Delete role</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
