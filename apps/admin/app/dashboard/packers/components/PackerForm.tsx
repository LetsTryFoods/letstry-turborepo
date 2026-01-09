'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { packerFormSchema } from "@/lib/validations/packer.schema"

interface PackerFormProps {
  onClose: () => void
  initialData?: any | null
  createPacker?: any
  updatePacker?: any
  onPackerCreated?: (packer: any, password: string) => void
}

export function PackerForm({ onClose, initialData, createPacker, updatePacker, onPackerCreated }: PackerFormProps) {
  const form = useForm({
    resolver: zodResolver(packerFormSchema as any),
    defaultValues: {
      employeeId: initialData?.employeeId || "",
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      isActive: initialData?.isActive ?? true,
    },
  })

  const onSubmit = async (data: any) => {
    try {
      if (initialData) {
        await updatePacker({
          variables: {
            packerId: initialData.id,
            input: {
              name: data.name,
              phone: data.phone,
              email: data.email,
              isActive: data.isActive,
            }
          }
        })
        onClose()
      } else {
        const result = await createPacker({
          variables: {
            input: {
              employeeId: data.employeeId,
              name: data.name,
              phone: data.phone,
              email: data.email,
            }
          }
        })

        if (onPackerCreated && result.data?.createPacker) {
          onPackerCreated(result.data.createPacker.packer, result.data.createPacker.generatedPassword)
        }
        onClose()
      }
    } catch (error) {
      console.error("Failed to save packer:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee ID *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., EMP001" disabled={!!initialData} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., John Doe" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., +919876543210" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="e.g., john@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {initialData && (
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Active</FormLabel>
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} Packer
          </Button>
        </div>
      </form>
    </Form>
  )
}
