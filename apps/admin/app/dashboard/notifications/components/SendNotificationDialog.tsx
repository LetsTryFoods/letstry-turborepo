"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bell,
  Mail,
  MessageSquare,
  Send,
  Clock,
  FileText
} from "lucide-react"
import {
  NotificationType,
  NotificationAudience,
  useSendNotification,
  useNotificationTemplates
} from "@/lib/notifications/useNotifications"

interface SendNotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function SendNotificationDialog({
  open,
  onOpenChange,
  onSuccess
}: SendNotificationDialogProps) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState<NotificationType>("PUSH")
  const [audience, setAudience] = useState<NotificationAudience>("ALL")
  const [scheduledAt, setScheduledAt] = useState("")
  const [isScheduled, setIsScheduled] = useState(false)

  const { sendNotification, loading } = useSendNotification()
  const { data: templatesData } = useNotificationTemplates()
  const templates = templatesData?.templates || []

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t._id === templateId)
    if (template) {
      setTitle(template.title)
      setMessage(template.message)
      setType(template.type)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) return

    await sendNotification({
      title,
      message,
      type,
      audience,
      scheduledAt: isScheduled ? scheduledAt : undefined
    })

    // Reset form
    setTitle("")
    setMessage("")
    setType("PUSH")
    setAudience("ALL")
    setScheduledAt("")
    setIsScheduled(false)

    onSuccess()
    onOpenChange(false)
  }

  const typeIcons = {
    PUSH: Bell,
    EMAIL: Mail,
    SMS: MessageSquare
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Notification</DialogTitle>
          <DialogDescription>
            Create and send a notification to your customers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Use Template (Optional)
            </Label>
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template._id} value={template._id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notification Type */}
          <div className="space-y-2">
            <Label>Notification Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["PUSH", "EMAIL", "SMS"] as NotificationType[]).map((t) => {
                const Icon = typeIcons[t]
                return (
                  <Button
                    key={t}
                    type="button"
                    variant={type === t ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => setType(t)}
                  >
                    <Icon className="h-4 w-4" />
                    {t}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter notification title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {message.length} characters
            </p>
          </div>

          {/* Audience */}
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Select
              value={audience}
              onValueChange={(value) => setAudience(value as NotificationAudience)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Customers</SelectItem>
                <SelectItem value="ACTIVE_CUSTOMERS">Active Customers</SelectItem>
                <SelectItem value="INACTIVE_CUSTOMERS">Inactive Customers</SelectItem>
                <SelectItem value="NEW_CUSTOMERS">New Customers (Last 30 days)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Schedule Option */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="schedule"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="schedule" className="flex items-center gap-2 cursor-pointer">
                <Clock className="h-4 w-4" />
                Schedule for later
              </Label>
            </div>
            {isScheduled && (
              <Input
                type="datetime-local"
                id="scheduled-at"
                name="scheduledAt"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !message.trim() || loading}
          >
            {isScheduled ? (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Schedule
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
