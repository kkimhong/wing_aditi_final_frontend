import type { ReportExpense } from "../schema/reportSchema"
import { mockMyExpenses } from "@/features/expenses/components/expenseMockData"
import { mockApprovalExpenses } from "@/features/approvals/components/approvalMockData"

const additionalReportExpenses: ReportExpense[] = [
  {
    id: "5010f0f8-dc26-4402-9e0d-6be67d24dc64",
    title: "Design Workshop Venue",
    amount: 560,
    currency: "USD",
    category: "Training",
    categoryId: "44444444-4444-4444-8444-444444444444",
    expenseDate: "2026-02-25",
    status: "APPROVED",
    submittedBy: "Nila Chan",
    departmentName: "Design",
    notes: null,
    receiptUrl: null,
    approvedBy: "Marcus Chen",
    approvedAt: "2026-02-26T07:00:00.000Z",
    createdAt: "2026-02-25T04:30:00.000Z",
  },
  {
    id: "d7bd74f2-8757-4d1a-a8db-06f29930b345",
    title: "Security Audit Subscription",
    amount: 1330,
    currency: "USD",
    category: "Software",
    categoryId: "33333333-3333-4333-8333-333333333333",
    expenseDate: "2026-01-30",
    status: "SUBMITTED",
    submittedBy: "Kara Lim",
    departmentName: "Security",
    notes: null,
    receiptUrl: null,
    approvedBy: null,
    approvedAt: null,
    createdAt: "2026-01-30T03:20:00.000Z",
  },
]

export const reportExpenses: ReportExpense[] = [
  ...mockMyExpenses,
  ...mockApprovalExpenses,
  ...additionalReportExpenses,
]
