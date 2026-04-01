import { api, getApiErrorMessage } from "@/lib/axios"
import type {
  DepartmentRequest,
  DepartmentResponse,
} from "../schema/departmentSchema"

export const departmentQueryKey = ["departments"] as const

export const departmentFn = async (): Promise<DepartmentResponse[]> => {
  try {
    const response = await api.get("/departments")
    const payload = response.data?.data ?? response.data

    if (!Array.isArray(payload)) {
      return []
    }

    return payload
      .map(normalizeDepartment)
      .filter((department): department is DepartmentResponse => department !== null)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to fetch departments")
    throw new Error(message)
  }
}

export const createDepartmentFn = async (payload: DepartmentRequest) => {
  const requestBody = toRequestPayload(payload)

  try {
    await api.post("/departments", requestBody)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to create department")
    throw new Error(message)
  }
}

export const updateDepartmentFn = async (
  id: string,
  payload: DepartmentRequest
) => {
  const requestBody = toRequestPayload(payload)

  try {
    await api.put(`/departments/${id}`, requestBody)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to update department")
    throw new Error(message)
  }
}

export const deleteDepartmentFn = async (id: string) => {
  try {
    await api.delete(`/departments/${id}`)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to delete department")
    throw new Error(message)
  }
}

function normalizeDepartment(raw: unknown): DepartmentResponse | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const row = raw as Record<string, unknown>

  const id = String(row.id ?? "")
  const name = String(row.name ?? "").trim()

  if (!id || !name) {
    return null
  }

  return {
    id,
    name,
    budgetLimit: toNullableNumber(row.budgetLimit ?? row.budget_limit),
    userCount: toNumber(row.userCount ?? row.user_count ?? 0),
    createdAt: String(row.createdAt ?? row.created_at ?? new Date().toISOString()),
  }
}

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function toNullableNumber(value: unknown) {
  if (value == null) {
    return null
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function toRequestPayload(payload: DepartmentRequest) {
  const normalizedBudget =
    typeof payload.budgetLimit === "number" && Number.isFinite(payload.budgetLimit)
      ? payload.budgetLimit
      : null

  return {
    name: payload.name,
    budgetLimit: normalizedBudget,
  }
}
