"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  RejectExpenseRequestSchema,
  type RejectExpenseRequest,
} from "../schema/expenseSchema"
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

interface RejectExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReject: (data: RejectExpenseRequest) => void
  isLoading?: boolean
}

export function RejectExpenseDialog({
  open,
  onOpenChange,
  onReject,
  isLoading,
}: RejectExpenseDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectExpenseRequest>({
    resolver: zodResolver(RejectExpenseRequestSchema),
  })

  const handleReject = (data: RejectExpenseRequest) => {
    onReject(data)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Expense</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this expense.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleReject)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comment">Reason</Label>
            <Textarea
              id="comment"
              placeholder="Enter rejection reason..."
              rows={4}
              {...register("comment")}
            />
            {errors.comment && (
              <p className="text-sm text-destructive">{errors.comment.message}</p>
            )}
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
