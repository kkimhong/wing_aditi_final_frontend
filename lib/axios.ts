import axios from "axios"
import { useAuthStore } from "@/store/authStore"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"

export const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

type ApiErrorResponseBody = {
  message?: string
  error?: string
}

function getResponseMessage(data: unknown) {
  if (!data || typeof data !== "object") {
    return null
  }

  const body = data as ApiErrorResponseBody

  if (typeof body.message === "string" && body.message.trim().length > 0) {
    return body.message.trim()
  }

  if (typeof body.error === "string" && body.error.trim().length > 0) {
    return body.error.trim()
  }

  return null
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const message = getResponseMessage(
      (
        error as {
          response?: {
            data?: unknown
          }
        }
      ).response?.data
    )

    if (message) {
      return message
    }
  }

  return fallback
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().clearAuth()
    }

    if (error?.response?.status === 403) {
      const message = getResponseMessage(error?.response?.data)
      if (message && typeof error === "object" && error !== null) {
        ;(error as { message?: string }).message = message
      }
    }

    return Promise.reject(error)
  }
)
