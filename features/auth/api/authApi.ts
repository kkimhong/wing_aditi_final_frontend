import { LoginRequest } from "../types/authType"
import { api } from "@/lib/axios"

export const authApi = async (data: LoginRequest) => {
  try {
    const response = await api.post("/auth/login", data)
    return response.data
  } catch (error: any) {
    const message = error.response?.data?.message || "Login failed"
    throw new Error(message)
  }
}
