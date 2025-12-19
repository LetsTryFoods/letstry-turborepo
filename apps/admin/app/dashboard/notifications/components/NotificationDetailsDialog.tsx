"use client"

import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Bell,
  Mail,
  MessageSquare,
  Users,
  Send,
  Clock,
  BarChart3,
  MousePointer,
  Calendar,
  User
} from "lucide-react"
import { 
  Notification, 
  NotificationStatus, 
  NotificationType 
} from "@/lib/notifications/useNotifications"

interface NotificationDetailsDialogProps {
  notification: Notification
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusConfig: Record<NotificationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Draft", variant: "outline" },
  SCHEDULED: { label: "Scheduled", variant: "secondary" },
  SENT: { label: "Sent", variant: "default" },
  FAILED: { label: "Failed", variant: "destructive" }
}

const typeConfig: Record<NotificationType, { label: string; icon: typeof Bell; color: string }> = {
  PUSH: { label: "Push Notification", icon: Bell, color: "text-purple-600 bg-purple-50" },
  EMAIL: { label: "Email", icon: Mail, color: "text-blue-600 bg-blue-50" },
  SMS: { label: "SMS", icon: MessageSquare, color: "text-green-600 bg-green-50" }
}

const audienceLabels: Record<string, string> = {
  ALL: "All Customers",
  ACTIVE_CUSTOMERS: "Active Customers",
  INACTIVE_CUSTOMERS: "Inactive Customers",
  NEW_CUSTOMERS: "New Customers",
  CUSTOM: "Custom Selection"
}

export default function NotificationDetailsDialog({
  notification,
  open,
  onOpenChange
}: NotificationDetailsDialogProps) {
  const status = statusConfig[notification.status]
  const type = typeConfig[notification.type]
  const TypeIcon = type.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notification Details</DialogTitle>
          <DialogDescription>
            Complete notification information and analytics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Type and Status */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${type.color}`}>
              <TypeIcon className="h-5 w-5" />
              <span className="font-medium">{type.label}</span>
            </div>
            <Badge variant={status.variant} className="text-sm">
              {status.label}
            </Badge>
          </div>

          {/* Title & Message */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Title</p>
            <p className="text-xl font-semibold">{notification.title}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Message</p>
            <p className="text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
              {notification.message}
            </p>
          </div>

          <Separator />

          {/* Audience & Timing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Audience</p>
                <p className="font-medium">{audienceLabels[notification.audience]}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {format(new Date(notification.createdAt), 'dd MMM yyyy, hh:mm a')}
                </p>
              </div>
            </div>
          </div>

          {/* Schedule/Sent Time */}
          {notification.status === 'SCHEDULED' && notification.scheduledAt && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-orange-600">Scheduled for</p>
                    <p className="font-semibold text-orange-700">
                      {format(new Date(notification.scheduledAt), 'EEEE, dd MMMM yyyy at hh:mm a')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {notification.sentAt && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Send className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sent at</p>
                <p className="font-medium">
                  {format(new Date(notification.sentAt), 'dd MMM yyyy, hh:mm a')}
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Stats */}
          <div>
            <p className="text-sm font-medium mb-3">Delivery Statistics</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-2xl font-bold">{notification.targetCount}</p>
                  <p className="text-xs text-muted-foreground">Target</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Send className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{notification.sentCount}</p>
                  <p className="text-xs text-muted-foreground">Sent</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold">
                    {notification.openRate ? `${notification.openRate}%` : '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">Open Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <MousePointer className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold">
                    {notification.clickRate ? `${notification.clickRate}%` : '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">Click Rate</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Created By */}
          <div className="flex items-center gap-3 pt-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Created by <span className="font-medium text-foreground">{notification.createdBy}</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
