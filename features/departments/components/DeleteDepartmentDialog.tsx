"use client"

import type { DepartmentResponse } from "../schema/departmentSchema"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeleteDepartmentDialogProps {
  open: boolean
  department: DepartmentResponse | null
  isDeleting?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteDepartmentDialog({
  open,
  department,
  isDeleting = false,
  onOpenChange,
  onConfirm,
}: DeleteDepartmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isDeleting}>
        <DialogHeader>
          <DialogTitle>Delete department</DialogTitle>
          <DialogDescription>
            {department
              ? `Are you sure you want to delete "${department.name}"? This action cannot be undone.`
              : "Are you sure you want to delete this department? This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
