"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { 
  Eye, 
  MoreHorizontal, 
  Trash2,
  Bell,
  Mail,
  MessageSquare,
  Send,
  Clock,
  Users,
  BarChart3
} from "lucide-react"
import { 
  Notification, 
  NotificationStatus, 
  NotificationType,
  useDeleteNotification 
} from "@/lib/notifications/useNotifications"
import NotificationDetailsDialog from "./NotificationDetailsDialog" 

interface NotificationTableProps {
  notifications: Notification[]
  onRefresh: () => void
}

const statusConfig: Record<NotificationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Draft", variant: "outline" },
  SCHEDULED: { label: "Scheduled", variant: "secondary" },
  SENT: { label: "Sent", variant: "default" },
  FAILED: { label: "Failed", variant: "destructive" }
}

const typeConfig: Record<NotificationType, { label: string; icon: typeof Bell }> = {
  PUSH: { label: "Push", icon: Bell },
  EMAIL: { label: "Email", icon: Mail },
  SMS: { label: "SMS", icon: MessageSquare }
}

export default function NotificationTable({ notifications, onRefresh }: NotificationTableProps) {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { deleteNotification } = useDeleteNotification()

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification)
    setShowDetailsDialog(true)
  }

  const handleDeleteNotification = (notification: Notification) => {
    setSelectedNotification(notification)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (selectedNotification) {
      await deleteNotification(selectedNotification._id)
      onRefresh()
    }
    setShowDeleteDialog(false)
    setSelectedNotification(null)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Sent/Target</TableHead>
              <TableHead className="text-center">Open Rate</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No notifications found
                </TableCell>
              </TableRow>
            ) : (
              notifications.map((notification) => {
                const status = statusConfig[notification.status]
                const type = typeConfig[notification.type]
                const TypeIcon = type.icon
                return (
                  <TableRow key={notification._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{type.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="font-medium text-sm truncate">{notification.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {notification.message}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm capitalize">
                          {notification.audience.replace('_', ' ').toLowerCase()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm">
                        {notification.sentCount} / {notification.targetCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {notification.openRate ? (
                        <div className="flex items-center justify-center gap-1">
                          <BarChart3 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{notification.openRate}%</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {notification.status === 'SCHEDULED' && notification.scheduledAt ? (
                          <div className="flex items-center gap-1 text-orange-600">
                            <Clock className="h-3 w-3" />
                            {format(new Date(notification.scheduledAt), 'dd MMM, HH:mm')}
                          </div>
                        ) : notification.sentAt ? (
                          <div className="flex items-center gap-1">
                            <Send className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(notification.sentAt), 'dd MMM yyyy')}
                          </div>
                        ) : (
                          format(new Date(notification.createdAt), 'dd MMM yyyy')
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(notification)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteNotification(notification)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Notification Details Dialog */}
      {selectedNotification && (
        <NotificationDetailsDialog
          notification={selectedNotification}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification?
              <span className="block mt-2 font-medium">&quot;{selectedNotification?.title}&quot;</span>
              <span className="block mt-2 text-red-600">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
