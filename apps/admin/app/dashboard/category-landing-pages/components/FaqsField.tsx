"use client";

import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { CategoryLandingPageFormValues } from "@/lib/validations/category-landing-page.schema";

interface FaqsFieldProps {
  form: UseFormReturn<CategoryLandingPageFormValues>;
}

export function FaqsField({ form }: FaqsFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel className="text-base font-semibold">FAQs</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ question: "", answer: "", position: fields.length })
          }
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add FAQ
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
          No FAQs yet. Click "Add FAQ" to add a question and answer.
        </p>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="border rounded-lg p-4 space-y-3 bg-gray-50/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              FAQ {index + 1}
            </span>
            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name={`faqs.${index}.position`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-1">
                    <FormLabel className="text-xs whitespace-nowrap">
                      Order
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="w-16 h-7 text-xs"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
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
          </div>

          <FormField
            control={form.control}
            name={`faqs.${index}.question`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="What is palm oil and why avoid it?"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`faqs.${index}.answer`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Answer *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="h-24 resize-none"
                    placeholder="Write the answer here..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  );
}
