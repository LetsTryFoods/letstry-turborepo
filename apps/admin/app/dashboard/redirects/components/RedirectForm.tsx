import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { redirectFormSchema } from '@/lib/validations/redirect.schema'
import { z } from 'zod'

type RedirectFormValues = z.infer<typeof redirectFormSchema>

interface RedirectFormProps {
  onClose: () => void
  initialData?: any | null
  createRedirect: any
  updateRedirect: any
}

export function RedirectForm({ onClose, initialData, createRedirect, updateRedirect }: RedirectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RedirectFormValues>({
    resolver: zodResolver(redirectFormSchema),
    defaultValues: {
      fromPath: initialData?.fromPath || '',
      toPath: initialData?.toPath || '',
      statusCode: initialData?.statusCode || 301,
      description: initialData?.description || '',
      source: initialData?.source || 'shopify',
      isActive: initialData?.isActive ?? true,
    },
  })

  const onSubmit = async (data: RedirectFormValues) => {
    try {
      setIsSubmitting(true)

      if (initialData) {
        await updateRedirect(initialData._id, data)
      } else {
        await createRedirect(data)
      }

      form.reset()
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fromPath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>From Path *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="/old-url"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="toPath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To Path *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="/new-url"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="statusCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status Code</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status code" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="301">301 - Permanent</SelectItem>
                    <SelectItem value="302">302 - Temporary</SelectItem>
                    <SelectItem value="307">307 - Temporary (Preserve Method)</SelectItem>
                    <SelectItem value="308">308 - Permanent (Preserve Method)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="shopify">Shopify</SelectItem>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional description for this redirect"
                  {...field}
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
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">Active</FormLabel>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (initialData ? 'Update' : 'Create')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
