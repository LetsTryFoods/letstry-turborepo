'use client'

import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Plus, Trash2 } from 'lucide-react'
import { LandingPageFormValues } from '@/lib/validations/landing-page.schema'

interface SectionPlatformLinksFieldProps {
  form: UseFormReturn<LandingPageFormValues>
  sectionIndex: number
}

export function SectionPlatformLinksField({ form, sectionIndex }: SectionPlatformLinksFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `sections.${sectionIndex}.platformLinks`,
  })

  return (
    <div className="space-y-2">
      <FormLabel>Platform Links</FormLabel>
      {fields.map((field, linkIndex) => (
        <div key={field.id} className="flex gap-2 items-start">
          <FormField
            control={form.control}
            name={`sections.${sectionIndex}.platformLinks.${linkIndex}.platform`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input {...field} placeholder="Platform (e.g. Amazon)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`sections.${sectionIndex}.platformLinks.${linkIndex}.url`}
            render={({ field }) => (
              <FormItem className="flex-[2]">
                <FormControl>
                  <Input {...field} placeholder="https://amazon.in/..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(linkIndex)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ platform: '', url: '' })}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Platform Link
      </Button>
    </div>
  )
}
