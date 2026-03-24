"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CreateExpenseRequestSchema,
  type CreateExpenseRequest,
} from "../schema/expenseSchema"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface CategoryOption {
  id: string
  name: string
}

interface ExpenseFormProps {
  onSubmit: (data: CreateExpenseRequest) => void
  defaultValues?: Partial<CreateExpenseRequest>
  categories?: CategoryOption[]
  isLoading?: boolean
}

export function ExpenseForm({
  onSubmit,
  defaultValues,
  categories = [],
  isLoading,
}: ExpenseFormProps) {
  const [receiptPreview, setReceiptPreview] = useState<string>(
    defaultValues?.receiptUrl ?? ""
  )
  const [receiptFileName, setReceiptFileName] = useState<string>("")
  const previewUrlRef = useRef<string>("")

  const {
    register,
    control,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateExpenseRequest>({
    resolver: zodResolver(CreateExpenseRequestSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      amount: defaultValues?.amount,
      currency: defaultValues?.currency ?? "USD",
      categoryId: defaultValues?.categoryId,
      expenseDate: defaultValues?.expenseDate,
      notes: defaultValues?.notes ?? "",
      receiptUrl: defaultValues?.receiptUrl ?? "",
    },
  })

  useEffect(() => {
    if (!defaultValues?.expenseDate) {
      setValue("expenseDate", new Date().toISOString().split("T")[0])
    }
  }, [defaultValues?.expenseDate, setValue])

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  const handleReceiptChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      clearReceipt()
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("receiptUrl", { message: "Please upload an image file" })
      return
    }

    clearErrors("receiptUrl")

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }

    const objectUrl = URL.createObjectURL(file)
    previewUrlRef.current = objectUrl
    setReceiptPreview(objectUrl)
    setReceiptFileName(file.name)
    setValue("receiptUrl", objectUrl, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const clearReceipt = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = ""
    }

    setReceiptPreview("")
    setReceiptFileName("")
    clearErrors("receiptUrl")
    setValue("receiptUrl", "", {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="Expense title" {...register("title")} />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            placeholder="USD"
            maxLength={3}
            {...register("currency", {
              setValueAs: (value: string) => value?.toUpperCase?.() ?? value,
            })}
          />
          {errors.currency && (
            <p className="text-sm text-destructive">{errors.currency.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && (
          <p className="text-sm text-destructive">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="expenseDate">Date</Label>
        <Input id="expenseDate" type="date" {...register("expenseDate")} />
        {errors.expenseDate && (
          <p className="text-sm text-destructive">{errors.expenseDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Optional notes"
          rows={4}
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      <input type="hidden" {...register("receiptUrl")} />

      <div className="space-y-2">
        <Label htmlFor="receiptFile">Receipt Image</Label>
        <Input
          id="receiptFile"
          type="file"
          accept="image/*"
          onChange={handleReceiptChange}
        />
        <p className="text-xs text-muted-foreground">
          Upload from your computer or mobile device.
        </p>

        {receiptPreview ? (
          <div className="space-y-2 rounded-none border p-3">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary">
                {receiptFileName || "Uploaded receipt image"}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={clearReceipt}
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Remove receipt</span>
              </Button>
            </div>
            <img
              src={receiptPreview}
              alt="Receipt preview"
              className="max-h-56 w-full rounded-none border object-contain"
            />
          </div>
        ) : null}

        {errors.receiptUrl && (
          <p className="text-sm text-destructive">{errors.receiptUrl.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : defaultValues ? "Update Expense" : "Create Expense"}
      </Button>
    </form>
  )
}
