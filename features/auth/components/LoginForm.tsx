"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { LoginRequest, LoginRequestSchema } from "../types/authType"

interface LoginFormProps {
  onSubmit: (data: LoginRequest) => void
  isLoading?: boolean
  errorMessage?: string | null
}

export function LoginForm({ onSubmit, isLoading, errorMessage }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
  })

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>

      {/* ✅ Form wraps everything including button */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="my-4">
          <div className="flex flex-col gap-6">
            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>

              <Input id="password" type="password" {...register("password")} />

              {errors.password && (
                <p className="text-sm text-destructive mb-2">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {errorMessage && (
            <p className="mt-4 text-sm text-destructive">{errorMessage}</p>
          )}
        </CardContent>

        {/* ✅ Button now inside form */}
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
