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
}

interface ExpenseCreateSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (values: CreateExpenseRequest) => void
  categories?: CategoryOption[]
  isLoading?: boolean
}

export function ExpenseCreateSheet({
  open,
  onOpenChange,
  onCreate,
  categories = [],
  isLoading,
}: ExpenseCreateSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Create Expense</SheetTitle>
          <SheetDescription>
            Fill in the details and submit your expense record.
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 pt-0">
          <ExpenseForm
            onSubmit={onCreate}
            categories={categories}
            isLoading={isLoading}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
