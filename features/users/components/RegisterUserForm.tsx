"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  RegisterRequestSchema,
  type RegisterRequest,
} from "../schema/userSchema"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectOption {
  id: string
  name: string
}

interface RegisterUserFormProps {
  onSubmit: (data: RegisterRequest) => void
  departments?: SelectOption[]
  roles?: SelectOption[]
  isLoading?: boolean
}

export function RegisterUserForm({
  onSubmit,
  departments = [],
  roles = [],
  isLoading,
}: RegisterUserFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(RegisterRequestSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstname">First Name</Label>
          <Input id="firstname" placeholder="First name" {...register("firstname")} />
          {errors.firstname ? (
            <p className="text-sm text-destructive">{errors.firstname.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastname">Last Name</Label>
          <Input id="lastname" placeholder="Last name" {...register("lastname")} />
          {errors.lastname ? (
            <p className="text-sm text-destructive">{errors.lastname.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="user@company.com"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="********"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Department</Label>
          <Select
            onValueChange={(value) =>
              setValue("departmentId", value, { shouldValidate: true })
            }
          >
            <SelectTrigger id="departmentId" className="w-full">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.departmentId ? (
            <p className="text-sm text-destructive">{errors.departmentId.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            onValueChange={(value) => setValue("roleId", value, { shouldValidate: true })}
          >
            <SelectTrigger id="roleId" className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.roleId ? (
            <p className="text-sm text-destructive">{errors.roleId.message}</p>
          ) : null}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Register User"}
      </Button>
    </form>
  )
}
