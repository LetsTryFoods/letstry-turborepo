"use client"

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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Loader2, Send, Mail, User, Phone } from "lucide-react"
import { 
  ContactQuery, 
  ContactStatus,
  statusLabels,
  useReplyToContact,
  useUpdateContactStatus
} from "@/lib/contact/useContact"

const replySchema = z.object({
  message: z.string().min(10, "Reply must be at least 10 characters"),
  updateStatus: z.boolean(),
  newStatus: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional()
})

type ReplyFormData = z.infer<typeof replySchema>

interface ContactReplyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  query: ContactQuery | null
  onSuccess: () => void
}

export default function ContactReplyDialog({
  open,
  onOpenChange,
  query,
  onSuccess
}: ContactReplyDialogProps) {
  const { reply, loading: replyLoading } = useReplyToContact()
  const { updateStatus, loading: statusLoading } = useUpdateContactStatus()

  const form = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      message: "",
      updateStatus: false,
      newStatus: "IN_PROGRESS"
    }
  })

  const watchUpdateStatus = form.watch("updateStatus")

  const onSubmit = async (data: ReplyFormData) => {
    if (!query) return

    try {
      await reply(query._id, { message: data.message })
      
      if (data.updateStatus && data.newStatus) {
        await updateStatus(query._id, data.newStatus)
      }

      form.reset()
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error sending reply:", error)
    }
  }

  const loading = replyLoading || statusLoading

  if (!query) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Reply to Query
          </DialogTitle>
          <DialogDescription>
            Send a response to the customer&apos;s query
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Query Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{query.name}</span>
              </div>
              <Badge variant="outline">{query.status}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {query.email}
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {query.phone}
              </div>
            </div>
            <div>
              <p className="font-medium">{query.subject}</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {query.message}
              </p>
            </div>
          </div>

          {/* Reply Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Reply</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your response to the customer..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This reply will be sent to the customer via email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="updateStatus"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Update Status</FormLabel>
                      <FormDescription>
                        Change the query status after sending reply
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {watchUpdateStatus && (
                <FormField
                  control={form.control}
                  name="newStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select new status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(Object.keys(statusLabels) as ContactStatus[]).map((status) => (
                            <SelectItem key={status} value={status}>
                              {statusLabels[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                  <Send className="mr-2 h-4 w-4" />
                  Send Reply
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
