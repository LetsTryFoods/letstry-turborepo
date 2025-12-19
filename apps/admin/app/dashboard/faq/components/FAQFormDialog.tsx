"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { FAQ, FAQCategory, categoryLabels, useCreateFAQ, useUpdateFAQ } from "@/lib/faq/useFAQ"

const faqSchema = z.object({
  question: z.string().min(10, "Question must be at least 10 characters"),
  answer: z.string().min(20, "Answer must be at least 20 characters"),
  category: z.enum(["GENERAL", "ORDERS", "SHIPPING", "RETURNS", "PRODUCTS", "PAYMENT"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  order: z.number().min(1, "Order must be at least 1")
})

type FAQFormData = z.infer<typeof faqSchema>

interface FAQFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  faq: FAQ | null
  onSuccess: () => void
  totalFAQs: number
}

const categories: FAQCategory[] = ["GENERAL", "ORDERS", "SHIPPING", "RETURNS", "PRODUCTS", "PAYMENT"]

export default function FAQFormDialog({
  open,
  onOpenChange,
  faq,
  onSuccess,
  totalFAQs
}: FAQFormDialogProps) {
  const { createFAQ, loading: createLoading } = useCreateFAQ()
  const { updateFAQ, loading: updateLoading } = useUpdateFAQ()
  const isEditing = !!faq

  const form = useForm<FAQFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      category: "GENERAL",
      status: "ACTIVE",
      order: totalFAQs + 1
    }
  })

  useEffect(() => {
    if (faq) {
      form.reset({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        status: faq.status,
        order: faq.order
      })
    } else {
      form.reset({
        question: "",
        answer: "",
        category: "GENERAL",
        status: "ACTIVE",
        order: totalFAQs + 1
      })
    }
  }, [faq, form, totalFAQs])

  const onSubmit = async (data: FAQFormData) => {
    try {
      if (isEditing) {
        await updateFAQ(faq._id, data)
      } else {
        await createFAQ(data)
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving FAQ:", error)
    }
  }

  const loading = createLoading || updateLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the FAQ details below"
              : "Fill in the details to create a new FAQ"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., How can I place an order?" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a clear and concise question that customers might ask
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed answer to the question..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Write a helpful and complete answer
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {categoryLabels[category]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Make this FAQ visible to customers on the website
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === "ACTIVE"}
                      onCheckedChange={(checked) => 
                        field.onChange(checked ? "ACTIVE" : "INACTIVE")
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update FAQ" : "Create FAQ"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
