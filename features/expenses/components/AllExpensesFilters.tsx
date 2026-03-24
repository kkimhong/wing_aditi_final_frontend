"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ExpenseStatus } from "@/types/common"
import { Search, X } from "lucide-react"

export interface AllExpensesFiltersState {
  search: string
  status: "ALL" | ExpenseStatus
  department: "ALL" | string
  category: "ALL" | string
  startDate: string
  endDate: string
}

interface AllExpensesFiltersProps {
  filters: AllExpensesFiltersState
  departments: string[]
  categories: string[]
  activeFilterCount: number
  resultCount: number
  onChange: (next: Partial<AllExpensesFiltersState>) => void
  onClear: () => void
}

export function AllExpensesFilters({
  filters,
  departments,
  categories,
  activeFilterCount,
  resultCount,
  onChange,
  onClear,
}: AllExpensesFiltersProps) {
  return (
    <section className="rounded-none border bg-card p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="space-y-2 xl:col-span-2">
          <Label htmlFor="expense-search">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="expense-search"
              placeholder="Title, submitter, or department"
              value={filters.search}
              className="pl-8"
              onChange={(event) => onChange({ search: event.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => onChange({ status: value as "ALL" | ExpenseStatus })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Department</Label>
          <Select
            value={filters.department}
            onValueChange={(value) => onChange({ department: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All departments</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={filters.category}
            onValueChange={(value) => onChange({ category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5 xl:items-end">
        <div className="space-y-2">
          <Label htmlFor="start-date">From</Label>
          <Input
            id="start-date"
            type="date"
            value={filters.startDate}
            onChange={(event) => onChange({ startDate: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-date">To</Label>
          <Input
            id="end-date"
            type="date"
            value={filters.endDate}
            onChange={(event) => onChange({ endDate: event.target.value })}
          />
        </div>

        <div className="flex items-center gap-2 xl:col-span-3 xl:justify-end">
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount} active</Badge>
          )}
          <p className="text-xs text-muted-foreground">
            {resultCount} result{resultCount === 1 ? "" : "s"}
          </p>
          {activeFilterCount > 0 && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onClear}>
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
