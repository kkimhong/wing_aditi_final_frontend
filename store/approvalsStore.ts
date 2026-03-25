import { create } from "zustand"
import type { ApprovalExpense } from "@/features/approvals/schema/approvalSchema"
import { mockApprovalExpenses } from "@/features/approvals/components/approvalMockData"

interface ApprovalsStore {
  expenses: ApprovalExpense[]
  approveExpense: (id: string, approvedBy?: string) => void
  rejectExpense: (id: string, comment: string, approvedBy?: string) => void
}

export const useApprovalsStore = create<ApprovalsStore>()((set) => ({
  expenses: mockApprovalExpenses,
  approveExpense: (id, approvedBy = "Current Approver") =>
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.id === id && expense.status === "SUBMITTED"
          ? {
              ...expense,
              status: "APPROVED",
              approvedBy,
              approvedAt: new Date().toISOString(),
            }
          : expense
      ),
    })),
  rejectExpense: (id, comment, approvedBy = "Current Approver") =>
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.id === id && expense.status === "SUBMITTED"
          ? {
              ...expense,
              status: "REJECTED",
              approvedBy,
              approvedAt: new Date().toISOString(),
              notes: comment,
            }
          : expense
      ),
    })),
}))
