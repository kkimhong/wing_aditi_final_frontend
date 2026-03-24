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
import type {
  ReportExportMode,
  ReportFilters,
  ReportStatusFilter,
} from "../schema/reportSchema"
import { Download, X } from "lucide-react"

interface ReportsFiltersProps {
  filters: ReportFilters
  departments: string[]
  resultCount: number
  activeFilterCount: number
  onChange: (next: Partial<ReportFilters>) => void
  onClear: () => void
  onExport: () => void
}

export function ReportsFilters({
  filters,
  departments,
  resultCount,
  activeFilterCount,
  onChange,
  onClear,
  onExport,
}: ReportsFiltersProps) {
  return (
    <section className="rounded-none border bg-card p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => onChange({ status: value as ReportStatusFilter })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={filters.department} onValueChange={(value) => onChange({ department: value })}>
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
          <Label htmlFor="report-start">From</Label>
          <Input
            id="report-start"
            type="date"
            value={filters.startDate}
            onChange={(event) => onChange({ startDate: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-end">To</Label>
          <Input
            id="report-end"
            type="date"
            value={filters.endDate}
            onChange={(event) => onChange({ endDate: event.target.value })}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4 xl:items-end">
        <div className="space-y-2">
          <Label>Export Mode</Label>
          <Select
            value={filters.exportMode}
            onValueChange={(value) => onChange({ exportMode: value as ReportExportMode })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select export mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTHLY">Monthly expenses</SelectItem>
              <SelectItem value="FILTERED_RANGE">Filtered duration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-month">Month</Label>
          <Input
            id="report-month"
            type="month"
            value={filters.month}
            onChange={(event) => onChange({ month: event.target.value })}
            disabled={filters.exportMode !== "MONTHLY"}
          />
        </div>

        <div className="flex items-center gap-2 xl:col-span-2 xl:justify-end">
          {activeFilterCount > 0 && <Badge variant="secondary">{activeFilterCount} active</Badge>}
          <p className="text-xs text-muted-foreground">
            {resultCount} row{resultCount === 1 ? "" : "s"}
          </p>
          {activeFilterCount > 0 && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onClear}>
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
          <Button size="sm" className="gap-1.5" onClick={onExport}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>
    </section>
  )
}
