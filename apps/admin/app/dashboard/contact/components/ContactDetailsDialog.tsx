"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Mail, 
  Phone, 
  Calendar,
  User,
  Package,
  MessageSquare,
  Clock
} from "lucide-react"
import { 
  ContactQuery, 
  ContactStatus,
  ContactPriority,
  statusLabels,
  priorityLabels,
  typeLabels
} from "@/lib/contact/useContact"
import { format } from "date-fns"

interface ContactDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  query: ContactQuery | null
  onReply: (query: ContactQuery) => void
}

const statusConfig: Record<ContactStatus, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
  NEW: { variant: "destructive" },
  IN_PROGRESS: { variant: "default" },
  RESOLVED: { variant: "secondary" },
  CLOSED: { variant: "outline" }
}

const priorityConfig: Record<ContactPriority, { className: string }> = {
  LOW: { className: "bg-gray-100 text-gray-800" },
  MEDIUM: { className: "bg-blue-100 text-blue-800" },
  HIGH: { className: "bg-orange-100 text-orange-800" },
  URGENT: { className: "bg-red-100 text-red-800" }
}

export default function ContactDetailsDialog({ 
  open, 
  onOpenChange, 
  query,
  onReply
}: ContactDetailsDialogProps) {
  if (!query) return null

  const status = statusConfig[query.status]
  const priority = priorityConfig[query.priority]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contact Query Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Status and Priority */}
            <div className="flex items-center gap-3">
              <Badge variant={status.variant}>
                {statusLabels[query.status]}
              </Badge>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority.className}`}>
                {priorityLabels[query.priority]} Priority
              </span>
              <Badge variant="outline">
                {typeLabels[query.type]}
              </Badge>
            </div>

            {/* Customer Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{query.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${query.email}`} className="text-blue-600 hover:underline">
                    {query.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${query.phone}`} className="text-blue-600 hover:underline">
                    {query.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(query.createdAt), "PPP 'at' p")}</span>
                </div>
              </div>
              {query.orderId && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>Related Order: </span>
                  <Badge variant="outline">{query.orderId}</Badge>
                </div>
              )}
              {query.assignedTo && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Assigned to: </span>
                  <Badge variant="secondary">{query.assignedTo}</Badge>
                </div>
              )}
            </div>

            <Separator />

            {/* Subject and Message */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Query Details
              </h3>
              <div>
                <p className="font-semibold text-lg">{query.subject}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="whitespace-pre-wrap">{query.message}</p>
              </div>
            </div>

            {/* Conversation Thread */}
            {query.replies.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    Conversation ({query.replies.length} {query.replies.length === 1 ? 'reply' : 'replies'})
                  </h3>
                  <div className="space-y-4">
                    {query.replies.map((reply) => (
                      <div 
                        key={reply._id}
                        className={`p-4 rounded-lg ${
                          reply.isAdminReply 
                            ? 'bg-primary/10 ml-8' 
                            : 'bg-muted/50 mr-8'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {reply.isAdminReply ? '🛡️ Admin' : query.name}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(reply.createdAt), "MMM d, yyyy 'at' p")}
                          </div>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Resolution Info */}
            {query.resolvedAt && (
              <>
                <Separator />
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    Resolved on {format(new Date(query.resolvedAt), "PPP 'at' p")}
                  </span>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {query.status !== "CLOSED" && (
            <Button onClick={() => {
              onOpenChange(false)
              onReply(query)
            }}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Reply
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
