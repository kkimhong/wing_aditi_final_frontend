import { api, getApiErrorMessage } from "@/lib/axios"
import type {
  CategoryRequest,
  CategoryResponse,
} from "../schema/categorySchema"

export const categoryQueryKey = ["categories"] as const

export const categoryFn = async (): Promise<CategoryResponse[]> => {
  try {
    const response = await api.get("/categories")
    const payload = response.data?.data ?? response.data

    if (!Array.isArray(payload)) {
      return []
    }

    return payload
      .map(normalizeCategory)
      .filter((category): category is CategoryResponse => category !== null)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to fetch categories")
    throw new Error(message)
  }
}

export const createCategoryFn = async (payload: CategoryRequest) => {
  try {
    await api.post("/categories", toCategoryPayload(payload))
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to create category")
    throw new Error(message)
  }
}

export const updateCategoryFn = async (id: string, payload: CategoryRequest) => {
  try {
    await api.put(`/categories/${id}`, toCategoryPayload(payload))
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to update category")
    throw new Error(message)
  }
}

export const updateCategoryStatusFn = async (
  id: string,
  active: boolean,
  fallbackPayload: CategoryRequest
) => {
  try {
    await api.patch(`/categories/${id}/toggle`, { active })
  } catch {
    try {
      await api.put(`/categories/${id}`, {
        ...toCategoryPayload(fallbackPayload),
        active,
      })
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to update category status")
      throw new Error(message)
    }
  }
}

export const deleteCategoryFn = async (id: string) => {
  try {
    await api.delete(`/categories/${id}`)
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to delete category")
    throw new Error(message)
  }
}

function normalizeCategory(raw: unknown): CategoryResponse | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const row = raw as Record<string, unknown>

  const id = String(row.id ?? "").trim()
  const name = String(row.name ?? "").trim()

  if (!id || !name) {
    return null
  }

  return {
    id,
    name,
    description: toNullableString(row.description),
    limitPerSubmission: toNullableNumber(
      row.limitPerSubmission ?? row.limit_per_submission
    ),
    active: toBoolean(row.active ?? row.isActive ?? row.is_active ?? row.status),
    createdAt: String(
      row.createdAt ?? row.created_at ?? new Date().toISOString()
    ),
  }
}

function toCategoryPayload(payload: CategoryRequest) {
  return {
    name: payload.name,
    description: payload.description?.trim() || null,
    limitPerSubmission:
      typeof payload.limitPerSubmission === "number" &&
      Number.isFinite(payload.limitPerSubmission)
        ? payload.limitPerSubmission
        : null,
  }
}

function toNullableString(value: unknown) {
  if (typeof value !== "string") {
    return null
  }

  const next = value.trim()
  return next.length > 0 ? next : null
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

function toBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "number") {
    return value !== 0
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (normalized === "active" || normalized === "true" || normalized === "1") {
      return true
    }

    if (normalized === "inactive" || normalized === "false" || normalized === "0") {
      return false
    }
  }

  return false
}
