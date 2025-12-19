'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreatePolicy } from '@/lib/policies/usePolicies'
import { policyFormSchema, PolicyFormValues } from '@/lib/validations/policy'
import { WysiwygEditor } from '@/components/custom/wysiwyg-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

export default function CreatePolicyPage() {
  const router = useRouter()
  const { mutate: createPolicy, loading: isCreating } = useCreatePolicy()

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      title: '',
      content: '',
      type: '',
    },
  })

  const onSubmit = async (values: PolicyFormValues) => {
    try {
      const result = await createPolicy({
        variables: {
          input: {
            title: values.title,
            content: values.content,
            type: values.title
          }
        }
      })
      
      if ((result.data as any)?.createPolicy?._id) {
        toast.success('Policy created successfully')
        router.push(`/dashboard/policies/${(result.data as any).createPolicy.title}`)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to create policy')
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create New Policy</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Policy Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter policy title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <WysiwygEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enter policy content..."
                        className="min-h-[400px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Policy
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
