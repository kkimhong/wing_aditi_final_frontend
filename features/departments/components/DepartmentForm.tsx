"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  DepartmentRequestSchema,
  type DepartmentRequest,
} from "../types/departmentTypes"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface DepartmentFormProps {
  onSubmit: (data: DepartmentRequest) => void
  defaultValues?: Partial<DepartmentRequest>
  isLoading?: boolean
}

export function DepartmentForm({
  onSubmit,
  defaultValues,
  isLoading,
}: DepartmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepartmentRequest>({
    resolver: zodResolver(DepartmentRequestSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Department Name</Label>
        <Input id="name" placeholder="Department name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="budgetLimit">Budget Limit</Label>
        <Input
          id="budgetLimit"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register("budgetLimit", { valueAsNumber: true })}
        />
        {errors.budgetLimit && (
          <p className="text-sm text-destructive">
            {errors.budgetLimit.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading
          ? "Saving…"
          : defaultValues
            ? "Update Department"
            : "Add Department"}
      </Button>
    </form>
  )
}
