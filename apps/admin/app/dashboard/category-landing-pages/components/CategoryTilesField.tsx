'use client'

import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Plus, Trash2 } from 'lucide-react'
import { CategoryLandingPageFormValues } from '@/lib/validations/category-landing-page.schema'

interface CategoryTilesFieldProps {
  form: UseFormReturn<CategoryLandingPageFormValues>
}

export function CategoryTilesField({ form }: CategoryTilesFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tiles',
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel className="text-base font-semibold">Category Tiles</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ name: '', blurb: '', imageUrl: '', shopNowUrl: '', position: fields.length })
          }
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add Tile
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
          No tiles yet. Click "Add Tile" to add a category card.
        </p>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="border rounded-lg p-4 space-y-3 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Tile {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="text-destructive h-7 w-7"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name={`tiles.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Bhujia & Namkeen" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`tiles.${index}.position`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} placeholder="0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`tiles.${index}.blurb`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Textarea {...field} className="h-16 resize-none" placeholder="Brief description of this category..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`tiles.${index}.imageUrl`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`tiles.${index}.shopNowUrl`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shop Now URL *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="/bhujia  or  https://external-site.com/..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  )
}
