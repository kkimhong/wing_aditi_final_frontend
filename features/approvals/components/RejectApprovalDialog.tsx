"use client"

import { useState, type FormEvent } from "react"
import type { RejectApprovalRequest } from "../schema/approvalSchema"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface RejectApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReject: (data: RejectApprovalRequest) => void
  isLoading?: boolean
}

export function RejectApprovalDialog({
  open,
  onOpenChange,
  onReject,
  isLoading,
}: RejectApprovalDialogProps) {
  const [comment, setComment] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmed = comment.trim()
    if (!trimmed) {
      setError("Please provide a reason for rejection")
      return
    }

    if (trimmed.length > 500) {
      setError("Comment too long")
      return
    }

    onReject({ comment: trimmed })
    setComment("")
    setError(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          setComment("")
          setError(null)
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Expense</DialogTitle>
          <DialogDescription>
            Add a reason for rejection so the submitter can revise clearly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comment">Reason</Label>
            <Textarea
              id="comment"
              placeholder="Enter rejection reason..."
              rows={4}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
