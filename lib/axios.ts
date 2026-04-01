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

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (
      error as {
        response?: {
          data?: {
            message?: string
            error?: string
          }
        }
      }
    ).response?.data?.message === "string"
  ) {
    return (
      error as {
        response?: {
          data?: {
            message?: string
          }
        }
      }
    ).response?.data?.message as string
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (
      error as {
        response?: {
          data?: {
            error?: string
          }
        }
      }
    ).response?.data?.error === "string"
  ) {
    return (
      error as {
        response?: {
          data?: {
            error?: string
          }
        }
      }
    ).response?.data?.error as string
  }

  return fallback
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().clearAuth()
    }

    return Promise.reject(error)
  }
)
