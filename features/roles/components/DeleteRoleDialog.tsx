"use client"

import type { RoleResponse } from "../schema/roleSchema"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeleteRoleDialogProps {
  open: boolean
  role: RoleResponse | null
  blockedReason?: string | null
  isDeleting?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteRoleDialog({
  open,
  role,
  blockedReason,
  isDeleting = false,
  onOpenChange,
  onConfirm,
}: DeleteRoleDialogProps) {
  const isBlocked = Boolean(blockedReason)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isDeleting}>
        <DialogHeader>
          <DialogTitle>{isBlocked ? "Role Cannot Be Deleted" : "Delete role"}</DialogTitle>
          <DialogDescription>
            {isBlocked
              ? blockedReason
              : role
                ? `Are you sure you want to delete "${role.name}"? This action cannot be undone.`
                : "Are you sure you want to delete this role? This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {isBlocked ? "Close" : "Cancel"}
          </Button>
          {!isBlocked ? (
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
