"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  AssignPermissionsRequestSchema,
  type AssignPermissionsRequest,
  type PermissionResponse,
} from "../schema/roleSchema"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface AssignPermissionsFormProps {
  permissions: PermissionResponse[]
  currentPermissionIds?: string[]
  onSubmit: (data: AssignPermissionsRequest) => void
  isLoading?: boolean
}

export function AssignPermissionsForm({
  permissions,
  currentPermissionIds = [],
  onSubmit,
  isLoading,
}: AssignPermissionsFormProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AssignPermissionsRequest>({
    resolver: zodResolver(AssignPermissionsRequestSchema),
    defaultValues: {
      permissionIds: currentPermissionIds,
    },
  })

  useEffect(() => {
    reset({ permissionIds: currentPermissionIds })
  }, [currentPermissionIds, reset])

  const selectedIds = watch("permissionIds") ?? []
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const filteredPermissions = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()
    if (!term) return permissions

    return permissions.filter((permission) => {
      return (
        permission.module.toLowerCase().includes(term) ||
        permission.action.toLowerCase().includes(term)
      )
    })
  }, [permissions, searchQuery])

  const groupedPermissions = useMemo(() => {
    return filteredPermissions.reduce<Record<string, PermissionResponse[]>>(
      (acc, permission) => {
        if (!acc[permission.module]) {
          acc[permission.module] = []
        }

        acc[permission.module].push(permission)
        return acc
      },
      {}
    )
  }, [filteredPermissions])

  const updateSelection = (nextIds: string[]) => {
    setValue("permissionIds", nextIds, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const togglePermission = (permissionId: string, checked: boolean) => {
    const next = new Set(selectedSet)

    if (checked) {
      next.add(permissionId)
    } else {
      next.delete(permissionId)
    }

    updateSelection(Array.from(next))
  }

  const toggleModule = (modulePermissions: PermissionResponse[], checked: boolean) => {
    const next = new Set(selectedSet)

    for (const permission of modulePermissions) {
      if (checked) {
        next.add(permission.id)
      } else {
        next.delete(permission.id)
      }
    }

    updateSelection(Array.from(next))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="permission-search">Search permissions</Label>
        <Input
          id="permission-search"
          placeholder="Search by module or action"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary">{selectedIds.length}</Badge>
        selected permission{selectedIds.length === 1 ? "" : "s"}
      </div>

      <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
        {Object.entries(groupedPermissions).length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No permissions match your search.
          </p>
        ) : (
          Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => {
            const selectedInModule = modulePermissions.filter((permission) =>
              selectedSet.has(permission.id)
            ).length

            const allSelected =
              modulePermissions.length > 0 &&
              selectedInModule === modulePermissions.length

            const partiallySelected =
              selectedInModule > 0 && selectedInModule < modulePermissions.length

            return (
              <div key={moduleName} className="rounded-none border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{moduleName}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedInModule}/{modulePermissions.length} selected
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`${moduleName}-select-all`}
                      checked={allSelected ? true : partiallySelected ? "indeterminate" : false}
                      onCheckedChange={(checked) =>
                        toggleModule(modulePermissions, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`${moduleName}-select-all`}
                      className="text-xs text-muted-foreground"
                    >
                      Select all
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  {modulePermissions.map((permission) => (
                    <label
                      key={permission.id}
                      htmlFor={permission.id}
                      className="flex cursor-pointer items-center gap-2 rounded-none border p-2 transition-colors hover:bg-muted/50"
                    >
                      <Checkbox
                        id={permission.id}
                        checked={selectedSet.has(permission.id)}
                        onCheckedChange={(checked) =>
                          togglePermission(permission.id, checked === true)
                        }
                      />
                      <span className="text-sm">{formatPermissionLabel(permission.action)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      {errors.permissionIds && (
        <p className="text-sm text-destructive">{errors.permissionIds.message}</p>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Permissions"}
      </Button>
    </form>
  )
}

function formatPermissionLabel(action: string) {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
