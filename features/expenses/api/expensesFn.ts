import { api, getApiErrorMessage } from "@/lib/axios"
import type {
  CreateExpenseRequest,
  ExpenseFilter,
  ExpenseResponse,
  UpdateExpenseRequest,
} from "../schema/expenseSchema"
import type { ExpenseStatus } from "@/types/common"

export const myExpensesQueryKey = ["expenses", "my"] as const

export const getMyExpensesFn = async (
  filters?: ExpenseFilter
): Promise<ExpenseResponse[]> => {
  try {
    const response = await api.get("/expenses/my", {
      params: toExpenseFilterParams(filters),
    })
    const payload = response.data?.data ?? response.data
    return toExpenseCollection(payload)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to fetch your expenses")
    throw new Error(message)
  }
}

export const createExpenseFn = async (
  payload: CreateExpenseRequest
): Promise<string | null> => {
  try {
    const response = await api.post("/expenses", toCreateExpensePayload(payload))
    const body = response.data?.data ?? response.data
    return extractExpenseId(body)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to create expense")
    throw new Error(message)
  }
}

export const updateExpenseFn = async (
  id: string,
  payload: UpdateExpenseRequest
) => {
  try {
    await api.put(`/expenses/${id}`, toUpdateExpensePayload(payload))
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to update expense")
    throw new Error(message)
  }
}

export const submitExpenseFn = async (id: string) => {
  try {
    await api.patch(`/expenses/${id}/submit`)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to submit expense")
    throw new Error(message)
  }
}

export const deleteExpenseFn = async (id: string) => {
  try {
    await api.delete(`/expenses/${id}`)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to delete expense")
    throw new Error(message)
  }
}

export function toExpenseCollection(payload: unknown): ExpenseResponse[] {
  const collection = toCollection(payload)

  return collection
    .map(normalizeExpense)
    .filter((expense): expense is ExpenseResponse => expense !== null)
}

export function normalizeExpense(raw: unknown): ExpenseResponse | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const row = raw as Record<string, unknown>

  const id = String(row.id ?? "").trim()
  const title = String(row.title ?? "").trim()
  const amount = toNumber(row.amount)
  const currency = toCurrency(row.currency)
  const expenseDate = toDateString(row.expenseDate ?? row.expense_date ?? row.date)
  const status = toExpenseStatus(row.status)
  const createdAt = toDateString(
    row.createdAt ?? row.created_at ?? row.createdOn ?? row.created_on
  )

  if (!id || !title || amount === null || !currency || !expenseDate || !createdAt) {
    return null
  }

  return {
    id,
    title,
    amount,
    currency,
    category: toCategoryName(row),
    categoryId: toCategoryId(row),
    expenseDate,
    notes: toNullableString(row.notes ?? row.note ?? row.comment),
    receiptUrl: toNullableString(row.receiptUrl ?? row.receipt_url ?? row.receipt),
    status,
    submittedBy: toPersonName(
      row.submittedBy ??
        row.submitted_by ??
        row.createdBy ??
        row.created_by ??
        row.user
    ),
    submittedByEmail: toSubmittedByEmail(row),
    departmentName: toDepartmentName(row),
    approvedBy: toNullablePersonName(
      row.approvedBy ?? row.approved_by ?? row.approver
    ),
    approvedAt: toNullableDateString(
      row.approvedAt ?? row.approved_at ?? row.approvedOn ?? row.approved_on
    ),
    createdAt,
  }
}

function toExpenseFilterParams(filters?: ExpenseFilter) {
  if (!filters) {
    return undefined
  }

  return {
    status: filters.status,
    departmentId: filters.departmentId,
    categoryId: filters.categoryId,
    startDate: filters.startDate,
    endDate: filters.endDate,
  }
}

function toCreateExpensePayload(payload: CreateExpenseRequest) {
  return {
    title: payload.title,
    amount: payload.amount,
    currency: payload.currency.trim().toUpperCase(),
    categoryId: payload.categoryId,
    expenseDate: payload.expenseDate,
    notes: payload.notes?.trim() || null,
    receiptUrl: payload.receiptUrl?.trim() || null,
  }
}

function extractExpenseId(payload: unknown) {
  if (typeof payload === "string") {
    const directId = payload.trim()
    return directId.length > 0 ? directId : null
  }

  if (!payload || typeof payload !== "object") {
    return null
  }

  const row = payload as Record<string, unknown>
  const rawId = row.id ?? row.expenseId ?? row.expense_id

  if (typeof rawId !== "string") {
    return null
  }

  const id = rawId.trim()
  return id.length > 0 ? id : null
}

function toUpdateExpensePayload(payload: UpdateExpenseRequest) {
  const requestBody: Record<string, unknown> = {}

  if (payload.title !== undefined) {
    requestBody.title = payload.title
  }

  if (payload.amount !== undefined) {
    requestBody.amount = payload.amount
  }

  if (payload.currency !== undefined) {
    requestBody.currency = payload.currency.trim().toUpperCase()
  }

  if (payload.categoryId !== undefined) {
    requestBody.categoryId = payload.categoryId
  }

  if (payload.expenseDate !== undefined) {
    requestBody.expenseDate = payload.expenseDate
  }

  if (payload.notes !== undefined) {
    requestBody.notes = payload.notes?.trim() || null
  }

  if (payload.receiptUrl !== undefined) {
    requestBody.receiptUrl = payload.receiptUrl?.trim() || null
  }

  if (payload.status !== undefined) {
    requestBody.status = payload.status
  }

  return requestBody
}

function toCollection(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== "object") {
    return []
  }

  const row = payload as Record<string, unknown>

  if (Array.isArray(row.content)) {
    return row.content
  }

  if (Array.isArray(row.items)) {
    return row.items
  }

  if (Array.isArray(row.results)) {
    return row.results
  }

  return []
}

function toNullableString(value: unknown) {
  if (typeof value !== "string") {
    return null
  }

  const next = value.trim()
  return next.length > 0 ? next : null
}

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function toCurrency(value: unknown) {
  if (typeof value !== "string") {
    return ""
  }

  const next = value.trim().toUpperCase()
  return next.length > 0 ? next : ""
}

function toExpenseStatus(value: unknown): ExpenseStatus {
  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase()

    if (normalized === "DRAFT") return "DRAFT"
    if (normalized === "SUBMITTED" || normalized === "PENDING") return "SUBMITTED"
    if (normalized === "APPROVED") return "APPROVED"
    if (normalized === "REJECTED") return "REJECTED"
  }

  return "DRAFT"
}

function toDateString(value: unknown) {
  if (typeof value !== "string") {
    return ""
  }

  const next = value.trim()
  return next.length > 0 ? next : ""
}

function toNullableDateString(value: unknown) {
  const next = toDateString(value)
  return next.length > 0 ? next : null
}

function toDepartmentName(row: Record<string, unknown>) {
  return (
    toNullableString(row.departmentName ?? row.department_name) ??
    toNullableString((row.department as Record<string, unknown> | null)?.name)
  )
}

function toCategoryId(row: Record<string, unknown>) {
  return (
    toNullableString(row.categoryId ?? row.category_id) ??
    toNullableString((row.category as Record<string, unknown> | null)?.id)
  )
}

function toCategoryName(row: Record<string, unknown>) {
  const rawCategory = row.category

  if (typeof rawCategory === "string") {
    const next = rawCategory.trim()
    return next.length > 0 ? next : null
  }

  return (
    toNullableString(row.categoryName ?? row.category_name) ??
    toNullableString((rawCategory as Record<string, unknown> | null)?.name)
  )
}

function toSubmittedByEmail(row: Record<string, unknown>) {
  const directEmail = toNullableEmail(
    row.submittedByEmail ??
      row.submitted_by_email ??
      row.createdByEmail ??
      row.created_by_email
  )

  if (directEmail) {
    return directEmail
  }

  const person =
    row.submittedBy ??
    row.submitted_by ??
    row.createdBy ??
    row.created_by ??
    row.user

  if (typeof person === "string") {
    return toNullableEmail(person)
  }

  if (!person || typeof person !== "object") {
    return null
  }

  const rowPerson = person as Record<string, unknown>
  return toNullableEmail(rowPerson.email ?? rowPerson.mail ?? rowPerson.username)
}

function toPersonName(value: unknown) {
  if (typeof value === "string") {
    const direct = value.trim()
    if (direct.length > 0) {
      return direct
    }
  }

  if (!value || typeof value !== "object") {
    return "Unknown User"
  }

  const person = value as Record<string, unknown>
  const firstName = toNullableString(person.firstname ?? person.firstName)
  const lastName = toNullableString(person.lastname ?? person.lastName)
  const name = toNullableString(person.name)
  const email = toNullableString(person.email)

  const joinedName = [firstName, lastName].filter(Boolean).join(" ").trim()

  if (joinedName.length > 0) {
    return joinedName
  }

  return name ?? email ?? "Unknown User"
}

function toNullablePersonName(value: unknown) {
  if (value == null) {
    return null
  }

  const resolved = toPersonName(value)
  return resolved === "Unknown User" ? null : resolved
}

function toNullableEmail(value: unknown) {
  const normalized = toNullableString(value)
  if (!normalized) {
    return null
  }

  return normalized.includes("@") ? normalized.toLowerCase() : null
}
