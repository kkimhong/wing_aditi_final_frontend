"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ExpenseStatus } from "@/types/common"
import { Search, X } from "lucide-react"

interface ExpenseFilterBarProps {
  onFilter: (filters: {
    status?: ExpenseStatus
    startDate?: string
    endDate?: string
  }) => void
  activeFilters?: number
}

export function ExpenseFilterBar({ onFilter, activeFilters = 0 }: ExpenseFilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Status</Label>
        <Select onValueChange={(val) => onFilter({ status: val as ExpenseStatus })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">From</Label>
        <Input
          type="date"
          className="w-[150px]"
          onChange={(e) => onFilter({ startDate: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">To</Label>
        <Input
          type="date"
          className="w-[150px]"
          onChange={(e) => onFilter({ endDate: e.target.value })}
        />
      </div>

      <Button variant="outline" size="sm" className="gap-1.5">
        <Search className="h-3.5 w-3.5" />
        Filter
      </Button>

      {activeFilters > 0 && (
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <X className="h-3.5 w-3.5" />
          Clear
          <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
            {activeFilters}
          </Badge>
        </Button>
      )}
    </div>
  )
}
