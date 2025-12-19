'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { addressFormSchema, AddressFormValues } from "@/lib/validations/address.schema"

interface AddressFormProps {
  onClose: () => void
  initialData?: any | null
  createAddress: any
  updateAddress: any
}

export function AddressForm({ onClose, initialData, createAddress, updateAddress }: AddressFormProps) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      batchCode: initialData?.batchCode || "",
      addressHeading: initialData?.addressHeading || "",
      subAddressHeading: initialData?.subAddressHeading || "",
      fssaiLicenseNumber: initialData?.fssaiLicenseNumber || "",
      isActive: initialData?.isActive ?? true,
    },
  })

  const onSubmit = async (data: AddressFormValues) => {
    try {
      if (initialData) {
        await updateAddress({
          variables: {
            id: initialData._id,
            input: data
          }
        })
      } else {
        await createAddress({
          variables: {
            input: data
          }
        })
      }
      onClose()
    } catch (error) {
      console.error("Failed to save address:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="batchCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch Code *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., EK, ER, TP" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fssaiLicenseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>FSSAI License Number *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., 10824999000091" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="addressHeading"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Earth Crust Private Limited" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subAddressHeading"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Address *</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="e.g., 118H, PHASE-V, SECTOR-56, HSIIDC, KUNDLI, DISTT. SONIPAT, HARYANA-131028" 
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">Is Active</FormLabel>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} Address
          </Button>
        </div>
      </form>
    </Form>
  )
}
