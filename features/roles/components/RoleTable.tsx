"use client"

import { useMemo, useState } from "react"
import {
  type ColumnDef,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Pencil, ShieldCheck, Trash2 } from "lucide-react"

interface RoleTableProps {
  roles: RoleResponse[]
  onEdit?: (role: RoleResponse) => void
  onManagePermissions?: (role: RoleResponse) => void
  onDelete?: (role: RoleResponse) => void
  getDeleteBlockedReason?: (role: RoleResponse) => string | null
}

export function RoleTable({
  roles,
  onEdit,
  onManagePermissions,
  onDelete,
  getDeleteBlockedReason,
}: RoleTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const columns = useMemo<ColumnDef<RoleResponse>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.description ?? "-"}</span>
        ),
      },
      {
        accessorKey: "priority",
        header: () => <div className="text-right">Priority</div>,
        cell: ({ row }) => (
          <p className="text-right tabular-nums">{row.original.priority}</p>
        ),
      },
      {
        accessorKey: "userCount",
        header: () => <div className="text-right">Users</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <Badge variant="outline">{row.original.userCount ?? 0}</Badge>
          </div>
        ),
      },
      {
        accessorKey: "permissionCount",
        header: () => <div className="text-right">Permissions</div>,
        cell: ({ row }) => {
          const permissionCount =
            Array.isArray(row.original.permissions) && row.original.permissions.length > 0
              ? row.original.permissions.length
              : (row.original.permissionCount ?? 0)

          return (
            <div className="text-right">
              <Badge variant="secondary">{permissionCount}</Badge>
            </div>
          )
        },
      },
      {
        id: "actions",
        header: () => <div className="w-[150px] text-right">Actions</div>,
        cell: ({ row }) => {
          const role = row.original
          const deleteBlockedReason = getDeleteBlockedReason?.(role) ?? null

          return (
            <div className="flex justify-end gap-1">
              {onEdit ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(role)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit role</span>
                </Button>
              ) : null}

              {onManagePermissions ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onManagePermissions(role)}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span className="sr-only">Manage permissions</span>
                </Button>
              ) : null}

              {onDelete ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onDelete(role)}
                          disabled={Boolean(deleteBlockedReason)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          <span className="sr-only">Delete role</span>
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {deleteBlockedReason ? (
                      <TooltipContent>{deleteBlockedReason}</TooltipContent>
                    ) : null}
                  </Tooltip>
                </TooltipProvider>
              ) : null}
            </div>
          )
        },
      },
    ]
  }, [getDeleteBlockedReason, onDelete, onEdit, onManagePermissions])

  const table = useReactTable({
    data: roles,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const pageCount = Math.max(table.getPageCount(), 1)
  const currentPage = Math.min(table.getState().pagination.pageIndex + 1, pageCount)

  return (
    <div className="rounded-none border bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No roles created yet.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Rows per page</span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[84px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            Page {currentPage} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
