"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { couponFormSchema, CouponFormValues } from "@/lib/validations/coupon.schema"
import { useCreateCoupon } from "@/lib/coupons/useCoupons"
import { Loader2, AlertTriangle } from "lucide-react"

interface CouponFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CouponForm({ onSuccess, onCancel }: CouponFormProps) {
  const { createCoupon, loading: createLoading } = useCreateCoupon()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingValues, setPendingValues] = useState<CouponFormValues | null>(null)

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      name: "",
      description: "",
      code: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      minCartValue: undefined,
      maxDiscountAmount: undefined,
      startDate: "",
      endDate: "",
      isActive: true,
    },
  })

  const discountType = form.watch("discountType")

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    form.setValue("code", code)
  }

  // Show confirmation dialog before creating
  const handleFormSubmit = (values: CouponFormValues) => {
    setPendingValues(values)
    setShowConfirmDialog(true)
  }

  // Actually create the coupon after confirmation
  const handleConfirmCreate = async () => {
    if (!pendingValues) return

    try {
      const input = {
        name: pendingValues.name,
        description: pendingValues.description,
        code: pendingValues.code.toUpperCase(),
        discountType: pendingValues.discountType,
        discountValue: pendingValues.discountValue,
        minCartValue: pendingValues.minCartValue || undefined,
        maxDiscountAmount: pendingValues.maxDiscountAmount || undefined,
        startDate: new Date(pendingValues.startDate).toISOString(),
        endDate: new Date(pendingValues.endDate).toISOString(),
        isActive: pendingValues.isActive,
      }

      await createCoupon(input as any)
      setShowConfirmDialog(false)
      onSuccess()
    } catch (error) {
      console.error("Failed to create coupon:", error)
      setShowConfirmDialog(false)
    }
  }

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Warning Banner */}
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>Important:</strong> Once a coupon is created, it cannot be edited. Please review all details carefully before creating.
          </p>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coupon Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Summer Sale" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Describe the coupon offer" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coupon Code *</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. SUMMER20"
                      className="font-mono uppercase"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <Button type="button" variant="outline" onClick={generateCode}>
                    Generate
                  </Button>
                </div>
                <FormDescription>
                  Uppercase letters, numbers, dashes and underscores only
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Discount Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Discount Settings</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="discountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                      <SelectItem value="FIXED">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Discount Value ({discountType === "PERCENTAGE" ? "%" : "₹"}) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={discountType === "PERCENTAGE" ? 100 : undefined}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="minCartValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Cart Value (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="No minimum"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>Leave empty for no minimum</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {discountType === "PERCENTAGE" && (
              <FormField
                control={form.control}
                name="maxDiscountAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Discount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="No limit"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>Cap the discount amount</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        <Separator />

        {/* Validity */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Validity Period</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Eligibility & Scope */}
        {/* <div className="space-y-4">
          <h3 className="text-lg font-semibold">Eligibility & Scope</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="eligibilityType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eligibility *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select eligibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ALL">All Users</SelectItem>
                      <SelectItem value="FIRST_ORDER">First Order Only</SelectItem>
                      <SelectItem value="SPECIFIC_USERS">Specific Users</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="applicationScope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Scope *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ALL_PRODUCTS">All Products</SelectItem>
                      <SelectItem value="SPECIFIC_CATEGORIES">Specific Categories</SelectItem>
                      <SelectItem value="SPECIFIC_PRODUCTS">Specific Products</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="usageLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usage Limit</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="Unlimited"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>
                  Maximum number of times this coupon can be used. Leave empty for unlimited.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div> */}

        <Separator />

        {/* Status */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Enable this coupon for use
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={createLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={createLoading}>
            {createLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Coupon"
            )}
          </Button>
        </div>
      </form>
    </Form>

    {/* Confirmation Dialog */}
    <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Confirm Coupon Creation
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Please review the coupon details carefully. <strong>Once created, this coupon cannot be edited.</strong>
            </p>
            {pendingValues && (
              <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                <p><strong>Code:</strong> {pendingValues.code.toUpperCase()}</p>
                <p><strong>Name:</strong> {pendingValues.name}</p>
                <p><strong>Discount:</strong> {pendingValues.discountType === 'PERCENTAGE' ? `${pendingValues.discountValue}%` : `₹${pendingValues.discountValue}`}</p>
                <p><strong>Status:</strong> {pendingValues.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            )}
            <p className="text-amber-600 font-medium">
              Are you sure you want to create this coupon?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={createLoading}>Go Back & Edit</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmCreate}
            disabled={createLoading}
          >
            {createLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Yes, Create Coupon"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
