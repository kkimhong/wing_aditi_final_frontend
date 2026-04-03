import { LoginRequest } from "../types/authType"
import { api, getApiErrorMessage } from "@/lib/axios"

export const authApi = async (data: LoginRequest) => {
  try {
    const response = await api.post("/auth/login", data)
    return response.data
  } catch (error: unknown) {
    const message = error.response?.data?.message || "Login failed"
    throw new Error(message)
  }
}

export const logoutApi = async () => {
  try {
    await api.post("/auth/logout")
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Logout failed")
    throw new Error(message)
  }
}