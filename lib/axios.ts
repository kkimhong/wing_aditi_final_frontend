import axios from "axios"
import Cookies from "js-cookie"

export const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token")

  if (!token) {
    return config
  }

  config.headers = config.headers ?? {}
  config.headers.Authorization = `Bearer ${token}`
  return config
})
