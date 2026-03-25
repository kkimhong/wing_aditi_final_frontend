"use client"

import { useMemo, useState } from "react"
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { UserResponse } from "../schema/userSchema"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

interface UserTableProps {
  users: UserResponse[]
  onEdit?: (user: UserResponse) => void
  onToggleStatus?: (user: UserResponse) => void
  emptyMessage?: string
}

export function UserTable({
  users,
  onEdit,
  onToggleStatus,
  emptyMessage = "No users found.",
}: UserTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const columns = useMemo<ColumnDef<UserResponse>[]>(() => {
    return [
      {
        id: "name",
        accessorFn: (row) => `${row.firstname} ${row.lastname}`,
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-8 px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.firstname} {row.original.lastname}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "roleName",
        header: "Role",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.roleName ?? "-"}</span>
        ),
      },
      {
        accessorKey: "departmentName",
        header: "Department",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.departmentName ?? "-"}
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "default" : "secondary"}>
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-8 px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Joined
            <ArrowUpDown className="h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="w-12" />,
        cell: ({ row }) => {
          const user = row.original

          if (!onEdit && !onToggleStatus) {
            return null
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit ? (
                  <DropdownMenuItem onClick={() => onEdit(user)}>
                    Edit user
                  </DropdownMenuItem>
                ) : null}
                {onToggleStatus ? (
                  <DropdownMenuItem onClick={() => onToggleStatus(user)}>
                    {user.isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ]
  }, [onEdit, onToggleStatus])

  const table = useReactTable({
    data: users,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
                {emptyMessage}
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
