"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Separator } from "@/components/ui/separator"
import { useCharges, useCreateOrUpdateCharges } from "@/lib/charges/useCharges"
import { chargesFormSchema, ChargesFormValues } from "@/lib/validations/charges.schema"
import { useEffect } from "react"
import { Loader2, Save, IndianRupee, Percent, Truck, Package } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function ChargesPage() {
  const { data, loading, error, refetch } = useCharges()
  const { createOrUpdateCharges, loading: updateLoading } = useCreateOrUpdateCharges()

  const charges = (data as any)?.charges

  const form = useForm<ChargesFormValues>({
    resolver: zodResolver(chargesFormSchema),
    defaultValues: {
      active: true,
      handlingCharge: 0,
      gstPercentage: 0,
      freeDeliveryThreshold: 0,
      deliveryDelhiBelowThreshold: 0,
      deliveryRestBelowThreshold: 0,
    },
  })

  // Update form when data loads
  useEffect(() => {
    if (charges) {
      form.reset({
        active: charges.active ?? true,
        handlingCharge: charges.handlingCharge ?? 0,
        gstPercentage: charges.gstPercentage ?? 0,
        freeDeliveryThreshold: charges.freeDeliveryThreshold ?? 0,
        deliveryDelhiBelowThreshold: charges.deliveryDelhiBelowThreshold ?? 0,
        deliveryRestBelowThreshold: charges.deliveryRestBelowThreshold ?? 0,
      })
    }
  }, [charges, form])

  const onSubmit = async (values: ChargesFormValues) => {
    try {
      await createOrUpdateCharges(values)
      refetch()
    } catch (error) {
      console.error("Failed to save charges:", error)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading charges: {error.message}</p>
            <Button onClick={() => refetch()} variant="outline" className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Charges & Fees</h1>
          <p className="text-muted-foreground">
            Configure handling charges, GST, and delivery fees
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Active Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Status
              </CardTitle>
              <CardDescription>
                Enable or disable charges globally
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        When enabled, charges will be applied to orders
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
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Handling & GST */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Handling & GST
                </CardTitle>
                <CardDescription>
                  Configure handling charges and GST percentage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="handlingCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Handling Charge (₹)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="pl-9"
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Fixed handling charge applied to each order
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gstPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Percentage (%)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            className="pl-9"
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        GST percentage applied to applicable items
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Delivery Charges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Charges
                </CardTitle>
                <CardDescription>
                  Configure delivery charges based on location
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="freeDeliveryThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Free Delivery Threshold (₹)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            className="pl-9"
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Orders above this amount get free delivery
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <p className="text-sm text-muted-foreground">
                  Delivery charges when order is below threshold:
                </p>

                <FormField
                  control={form.control}
                  name="deliveryDelhiBelowThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delhi NCR Delivery (₹)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            className="pl-9"
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Delivery charge for Delhi NCR region
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryRestBelowThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rest of India Delivery (₹)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            className="pl-9"
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Delivery charge for rest of India
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={updateLoading}>
              {updateLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}