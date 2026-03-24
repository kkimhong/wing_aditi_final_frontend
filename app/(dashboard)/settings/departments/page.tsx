"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DepartmentForm } from "@/features/departments/components/DepartmentForm"
import { DepartmentTable } from "@/features/departments/components/DepartmentTable"
import type { DepartmentResponse, DepartmentRequest } from "@/features/departments/types/departmentTypes"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

// Mock data — replace with API calls
const mockDepartments: DepartmentResponse[] = []

export default function DepartmentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = (data: DepartmentRequest) => {
    console.log("Create department:", data)
    setDialogOpen(false)
  }

  return (
    <DashboardLayout
      title="Departments"
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Department</DialogTitle>
              <DialogDescription>
                Create a new department.
              </DialogDescription>
            </DialogHeader>
            <DepartmentForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      }
    >
      <DepartmentTable departments={mockDepartments} />
    </DashboardLayout>
  )
}
