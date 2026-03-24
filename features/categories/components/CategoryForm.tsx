"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CategoryRequestSchema,
  type CategoryRequest,
} from "../types/categoryTypes"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CategoryFormProps {
  onSubmit: (data: CategoryRequest) => void
  defaultValues?: Partial<CategoryRequest>
  isLoading?: boolean
}

export function CategoryForm({
  onSubmit,
  defaultValues,
  isLoading,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryRequest>({
    resolver: zodResolver(CategoryRequestSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Category name"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Optional description…"
          rows={3}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="limitPerSubmission">Limit per Submission</Label>
        <Input
          id="limitPerSubmission"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register("limitPerSubmission", { valueAsNumber: true })}
        />
        {errors.limitPerSubmission && (
          <p className="text-sm text-destructive">
            {errors.limitPerSubmission.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving…" : defaultValues ? "Update Category" : "Add Category"}
      </Button>
    </form>
  )
}
