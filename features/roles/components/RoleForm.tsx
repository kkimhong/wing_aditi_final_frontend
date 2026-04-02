"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { RoleRequestSchema, type RoleRequest } from "../schema/roleSchema"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface RoleFormProps {
  onSubmit: (data: RoleRequest) => void
  defaultValues?: Partial<RoleRequest>
  isLoading?: boolean
}

type RoleFormValues = z.input<typeof RoleRequestSchema>

export function RoleForm({ onSubmit, defaultValues, isLoading }: RoleFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues, unknown, RoleRequest>({
    resolver: zodResolver(RoleRequestSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      priority: defaultValues?.priority ?? 0,
      permissionIds: defaultValues?.permissionIds ?? [],
    },
  })

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      priority: defaultValues?.priority ?? 0,
      permissionIds: defaultValues?.permissionIds ?? [],
    })
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Role Name</Label>
        <Input id="name" placeholder="Role name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Optional description"
          rows={3}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Input
          id="priority"
          type="number"
          placeholder="0"
          {...register("priority", { valueAsNumber: true })}
        />
        {errors.priority && (
          <p className="text-sm text-destructive">{errors.priority.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : defaultValues ? "Update Role" : "Add Role"}
      </Button>
    </form>
  )
}
