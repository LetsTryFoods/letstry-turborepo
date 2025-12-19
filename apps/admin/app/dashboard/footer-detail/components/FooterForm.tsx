'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { footerFormSchema, FooterFormValues } from "@/lib/validations/footer.schema"
import { Plus, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface FooterFormProps {
  onClose: () => void
  initialData?: any | null
  createFooter: any
  updateFooter: any
}


export function FooterForm({ onClose, initialData, createFooter, updateFooter }: FooterFormProps) {
  const form = useForm<FooterFormValues>({
    resolver: zodResolver(footerFormSchema),
    defaultValues: {
      logoUrl: initialData?.logoUrl || "",
      companyName: initialData?.companyName || "",
      cin: initialData?.cin || "",
      address: initialData?.address || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      exportEmail: initialData?.exportEmail || "",
      socialMediaTitle: initialData?.socialMediaTitle || "Follow us",
      socialMediaLinks: initialData?.socialMediaLinks || [],
      isActive: initialData?.isActive ?? true,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialMediaLinks",
  })

  const onSubmit = async (data: FooterFormValues) => {
    try {
      // Clean up empty optional fields
      const cleanedData = {
        ...data,
        logoUrl: data.logoUrl || undefined,
        exportEmail: data.exportEmail || undefined,
        socialMediaTitle: data.socialMediaTitle || undefined,
        socialMediaLinks: data.socialMediaLinks?.length ? data.socialMediaLinks : undefined,
      }

      if (initialData) {
        await updateFooter({
          variables: {
            id: initialData._id,
            input: cleanedData
          }
        })
      } else {
        await createFooter({
          variables: {
            input: cleanedData
          }
        })
      }
      onClose()
    } catch (error) {
      console.error("Failed to save footer detail:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* Logo Section */}
        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., https://example.com/logo.png" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Earth Crust Pvt Ltd" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CIN *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., U15549DL2020PTC365385" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address *</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="e.g., 329, 1st Floor, Indra Vihar, Delhi-110009" 
                  rows={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="e.g., ecom@earthcrust.co.in" />
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
                  <Input {...field} placeholder="e.g., +91-9654-932-262" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="exportEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Export Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="e.g., export@earthcrust.co.in" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="my-4" />

        {/* Social Media Section */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="socialMediaTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Social Media Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Follow us" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FormLabel>Social Media Links</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ platform: "", url: "", iconUrl: "" })}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Link
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-start p-3 border rounded-lg">
                <FormField
                  control={form.control}
                  name={`socialMediaLinks.${index}.platform`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Platform</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Facebook" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`socialMediaLinks.${index}.url`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., https://facebook.com/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`socialMediaLinks.${index}.iconUrl`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Icon URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-6 text-destructive hover:text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
                No social media links added. Click &quot;Add Link&quot; to add one.
              </p>
            )}
          </div>
        </div>

        <Separator className="my-4" />

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

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} Footer Detail
          </Button>
        </div>
      </form>
    </Form>
  )
}
