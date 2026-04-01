"use client"

import type { CreateExpenseRequest } from "../types/expenseTypes"
import { ExpenseForm } from "./ExpenseForm"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface CategoryOption {
  id: string
  name: string
  limitPerSubmission?: number | null
}

interface ExpenseCreateSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (
    values: CreateExpenseRequest,
    submitForApproval?: boolean
  ) => Promise<void> | void
  defaultValues?: Partial<CreateExpenseRequest>
  categories?: CategoryOption[]
  allowSubmit?: boolean
  isLoading?: boolean
}

export function ExpenseCreateSheet({
  open,
  onOpenChange,
  onCreate,
  defaultValues,
  categories = [],
  allowSubmit = true,
  isLoading,
}: ExpenseCreateSheetProps) {
  const isEdit = Boolean(defaultValues)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Expense" : "Create Expense"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the expense details before submitting."
              : "Fill in the details and submit your expense record."}
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 pt-0">
          <ExpenseForm
            onSubmit={onCreate}
            defaultValues={defaultValues}
            categories={categories}
            allowSubmit={allowSubmit}
            isLoading={isLoading}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
