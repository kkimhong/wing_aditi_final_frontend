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
import type { ExpenseResponse } from "../types/expenseTypes"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { ExpenseStatusBadge } from "./ExpenseStatusBadge"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

interface ExpenseTableProps {
  expenses: ExpenseResponse[]
  onRowAction?: (expense: ExpenseResponse, action: string) => void
  showActions?: boolean
  showSubmitter?: boolean
  showDepartment?: boolean
  showApprover?: boolean
  rowActions?: (expense: ExpenseResponse) => ExpenseRowAction[]
  emptyMessage?: string
}

interface ExpenseRowAction {
  label: string
  action: string
  destructive?: boolean
}

export function ExpenseTable({
  expenses,
  onRowAction,
  showActions = true,
  showSubmitter = false,
  showDepartment = false,
  showApprover = false,
  rowActions,
  emptyMessage = "No expenses found.",
}: ExpenseTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const columns = useMemo<ColumnDef<ExpenseResponse>[]>(() => {
    const baseColumns: ColumnDef<ExpenseResponse>[] = [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-8 px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.title}</span>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Amount
              <ArrowUpDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <p className="text-right tabular-nums font-medium">
            {formatAmount(row.original.amount, row.original.currency)}
          </p>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.category ?? "-"}
          </span>
        ),
      },
      ...(showSubmitter
        ? [
            {
              accessorKey: "submittedBy",
              header: "Submitter",
              cell: ({ row }) => (
                <span className="text-muted-foreground">
                  {row.original.submittedBy}
                </span>
              ),
            } satisfies ColumnDef<ExpenseResponse>,
          ]
        : []),
      ...(showDepartment
        ? [
            {
              accessorKey: "departmentName",
              header: "Department",
              cell: ({ row }) => (
                <span className="text-muted-foreground">
                  {row.original.departmentName ?? "-"}
                </span>
              ),
            } satisfies ColumnDef<ExpenseResponse>,
          ]
        : []),
      ...(showApprover
        ? [
            {
              accessorKey: "approvedBy",
              header: "Approver",
              cell: ({ row }) => (
                <span className="text-muted-foreground">
                  {row.original.approvedBy ?? "-"}
                </span>
              ),
            } satisfies ColumnDef<ExpenseResponse>,
          ]
        : []),
      {
        accessorKey: "expenseDate",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-8 px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {new Date(row.original.expenseDate).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <ExpenseStatusBadge status={row.original.status} />,
      },
    ]

    if (!showActions) {
      return baseColumns
    }

    return [
      ...baseColumns,
      {
        id: "actions",
        header: () => <div className="w-12" />,
        cell: ({ row }) => {
          const expense = row.original
          const actions = rowActions?.(expense) ?? getDefaultActions(expense)

          if (actions.length === 0) {
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
                {actions.map((actionItem) => (
                  <DropdownMenuItem
                    key={actionItem.action}
                    className={actionItem.destructive ? "text-destructive" : ""}
                    onClick={() => onRowAction?.(expense, actionItem.action)}
                  >
                    {actionItem.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ]
  }, [
    onRowAction,
    rowActions,
    showActions,
    showSubmitter,
    showDepartment,
    showApprover,
  ])

  const table = useReactTable({
    data: expenses,
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

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

function getDefaultActions(expense: ExpenseResponse): ExpenseRowAction[] {
  const actions: ExpenseRowAction[] = [{ label: "View details", action: "view" }]

  if (expense.status === "DRAFT") {
    actions.push({ label: "Submit", action: "submit" })
    actions.push({ label: "Delete", action: "delete", destructive: true })
  }

  if (expense.status === "REJECTED") {
    actions.push({ label: "Resubmit", action: "submit" })
  }

  return actions
}
