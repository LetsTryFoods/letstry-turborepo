'use client'

import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FormLabel } from '@/components/ui/form'
import { Plus, X } from 'lucide-react'
import { LandingPageFormValues } from '@/lib/validations/landing-page.schema'

interface SectionProductSlugsFieldProps {
  form: UseFormReturn<LandingPageFormValues>
  sectionIndex: number
}

export function SectionProductSlugsField({ form, sectionIndex }: SectionProductSlugsFieldProps) {
  const [input, setInput] = useState('')

  const slugs: string[] = form.watch(`sections.${sectionIndex}.productSlugs`) || []

  const addSlug = () => {
    const trimmed = input.trim()
    if (trimmed && !slugs.includes(trimmed)) {
      form.setValue(`sections.${sectionIndex}.productSlugs`, [...slugs, trimmed])
      setInput('')
    }
  }

  const removeSlug = (slug: string) => {
    form.setValue(
      `sections.${sectionIndex}.productSlugs`,
      slugs.filter((s) => s !== slug)
    )
  }

  return (
    <div className="space-y-2">
      <FormLabel>Product Slugs</FormLabel>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter product slug"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSlug() } }}
        />
        <Button type="button" variant="outline" size="sm" onClick={addSlug}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {slugs.map((slug) => (
          <Badge key={slug} variant="secondary" className="gap-1">
            {slug}
            <button type="button" onClick={() => removeSlug(slug)}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
