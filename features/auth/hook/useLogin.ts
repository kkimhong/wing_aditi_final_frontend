import { useMutation } from "@tanstack/react-query"
import { use } from "react"
import { authApi } from "../api/authApi"

export const useLogin = () => {
    return useMutation({
        mutationFn: authApi,
    })
}