'use client'


import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePolicies, useCreatePolicy, useUpdatePolicy, useDeletePolicy } from '@/lib/policies/usePolicies'
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
import { Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function PolicyPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const policyType = decodeURIComponent(slug)

  const { data, loading, error, refetch } = usePolicies()
  const { mutate: createPolicy, loading: isCreating } = useCreatePolicy()
  const { mutate: updatePolicy, loading: isUpdating } = useUpdatePolicy()
  const { mutate: deletePolicy } = useDeletePolicy()
  const isSubmitting = isCreating || isUpdating
  
  const policies = (data as any)?.policies || []
  const existingPolicy = policies.find((p: any) => p.title === policyType)
  
  const policyId = existingPolicy?._id
  const formValues: PolicyFormValues = {
    title: existingPolicy?.title || '',
    content: existingPolicy?.content || '',
    type: existingPolicy?.type || '',
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const confirmDelete = async () => {
    if (!policyId) return

    try {
      await deletePolicy({
        variables: { id: policyId }
      })
      toast.success('Policy deleted successfully')
      setDeleteDialogOpen(false)
      router.push('/dashboard')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete policy')
    }
  }

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    values: formValues,
  })

  if (!policyType) {
    return <div className="p-8">Invalid policy slug</div>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="p-8 text-red-500">Error loading policy: {error.message}</div>
  }

  if (!existingPolicy) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Policy Not Found</h2>
        <p className="text-muted-foreground">The policy "{policyType}" does not exist.</p>
        <Button onClick={() => router.push('/dashboard/policies/create')}>Create New Policy</Button>
      </div>
    )
  }

  const onSubmit = async (values: PolicyFormValues) => {
    try {
      if (policyId) {
        await updatePolicy({
          variables: {
            id: policyId,
            input: {
              title: values.title,
              content: values.content,
              type: policyType
            }
          }
        })
        toast.success('Policy updated successfully')
      } else {
        const result = await createPolicy({
          variables: {
            input: {
              title: values.title,
              content: values.content,
              type: policyType
            }
          }
        })
        if ((result.data as any)?.createPolicy?._id) {
          toast.success('Policy created successfully')
        }
      }
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save policy')
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{existingPolicy?.title || policyType || 'Edit Policy'}</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Policy Content</CardTitle>
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

              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={!policyId || isSubmitting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Policy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {policyId ? 'Update Policy' : 'Create Policy'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the policy "{existingPolicy?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
