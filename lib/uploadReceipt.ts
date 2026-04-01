import axios from "axios"
import { api, getApiErrorMessage } from "@/lib/axios"

interface PresignedUploadResponse {
  uploadUrl?: string
  publicUrl?: string
}

export async function uploadReceipt(file: File): Promise<string> {
  try {
    const response = await api.post<PresignedUploadResponse>(
      "/storage/presigned-url",
      {
        filename: file.name,
        contentType: file.type,
      }
    )

    const payload = response.data as unknown
    const root =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : null
    const nested =
      root?.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null

    const uploadUrl = toString(root?.uploadUrl) ?? toString(nested?.uploadUrl)
    const publicUrl = toString(root?.publicUrl) ?? toString(nested?.publicUrl)

    if (!uploadUrl || !publicUrl) {
      throw new Error("Missing upload URL")
    }

    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    })

    return publicUrl
  } catch (error: unknown) {
    const message = getApiErrorMessage(error, "Failed to upload receipt")
    throw new Error(message)
  }
}

function toString(value: unknown) {
  if (typeof value !== "string") {
    return null
  }

  const next = value.trim()
  return next.length > 0 ? next : null
}
