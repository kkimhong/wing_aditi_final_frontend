"use client"

import type { DepartmentResponse } from "../types/departmentTypes"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"

interface DepartmentTableProps {
  departments: DepartmentResponse[]
  onEdit?: (dept: DepartmentResponse) => void
}

export function DepartmentTable({ departments, onEdit }: DepartmentTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Budget Limit</TableHead>
            <TableHead className="text-right">Users</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No departments found.
              </TableCell>
            </TableRow>
          ) : (
            departments.map((dept) => (
              <TableRow key={dept.id}>
                <TableCell className="font-medium">{dept.name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {dept.budgetLimit != null
                    ? `$${dept.budgetLimit.toFixed(2)}`
                    : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {dept.userCount}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(dept.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit?.(dept)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
