"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CategoryRequestSchema,
  type CategoryRequest,
} from "../schema/categorySchema"
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
    reset,
    formState: { errors },
  } = useForm<CategoryRequest>({
    resolver: zodResolver(CategoryRequestSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      limitPerSubmission:
        typeof defaultValues?.limitPerSubmission === "number"
          ? defaultValues.limitPerSubmission
          : undefined,
    },
  })

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      limitPerSubmission:
        typeof defaultValues?.limitPerSubmission === "number"
          ? defaultValues.limitPerSubmission
          : undefined,
    })
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Category name" {...register("name")} />
        {errors.name ? (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Optional description..."
          rows={3}
          {...register("description")}
        />
        {errors.description ? (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="limitPerSubmission">Limit per Submission</Label>
        <Input
          id="limitPerSubmission"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register("limitPerSubmission", {
            setValueAs: (value) => {
              if (value === "" || value == null) {
                return undefined
              }

              const parsed = Number(value)
              return Number.isNaN(parsed) ? undefined : parsed
            },
          })}
        />
        {errors.limitPerSubmission ? (
          <p className="text-sm text-destructive">{errors.limitPerSubmission.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : defaultValues ? "Update Category" : "Add Category"}
      </Button>
    </form>
  )
}
