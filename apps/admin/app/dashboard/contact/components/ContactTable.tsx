"use client"

import { useState } from "react"
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  MoreHorizontal, 
  Trash2,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react"
import { 
  ContactQuery, 
  ContactStatus,
  ContactPriority,
  statusLabels,
  priorityLabels,
  typeLabels,
  useUpdateContactStatus,
  useDeleteContact
} from "@/lib/contact/useContact"
import { formatDistanceToNow } from "date-fns"

interface ContactTableProps {
  queries: ContactQuery[]
  onRefresh: () => void
  onView: (query: ContactQuery) => void
  onReply: (query: ContactQuery) => void
}

const statusConfig: Record<ContactStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  NEW: { label: "New", variant: "destructive", icon: <AlertTriangle className="h-3 w-3" /> },
  IN_PROGRESS: { label: "In Progress", variant: "default", icon: <Clock className="h-3 w-3" /> },
  RESOLVED: { label: "Resolved", variant: "secondary", icon: <CheckCircle className="h-3 w-3" /> },
  CLOSED: { label: "Closed", variant: "outline", icon: <XCircle className="h-3 w-3" /> }
}

const priorityConfig: Record<ContactPriority, { label: string; className: string }> = {
  LOW: { label: "Low", className: "bg-gray-100 text-gray-800" },
  MEDIUM: { label: "Medium", className: "bg-blue-100 text-blue-800" },
  HIGH: { label: "High", className: "bg-orange-100 text-orange-800" },
  URGENT: { label: "Urgent", className: "bg-red-100 text-red-800" }
}

export default function ContactTable({ queries, onRefresh, onView, onReply }: ContactTableProps) {
  const [selectedQuery, setSelectedQuery] = useState<ContactQuery | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { updateStatus } = useUpdateContactStatus()
  const { deleteContact } = useDeleteContact()

  const handleStatusChange = async (query: ContactQuery, status: ContactStatus) => {
    await updateStatus(query._id, status)
    onRefresh()
  }

  const handleDelete = (query: ContactQuery) => {
    setSelectedQuery(query)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (selectedQuery) {
      await deleteContact(selectedQuery._id)
      onRefresh()
    }
    setShowDeleteDialog(false)
    setSelectedQuery(null)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Priority</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No contact queries found
                </TableCell>
              </TableRow>
            ) : (
              queries.map((query) => {
                const status = statusConfig[query.status]
                const priority = priorityConfig[query.priority]
                return (
                  <TableRow key={query._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{query.name}</p>
                        <p className="text-sm text-muted-foreground">{query.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[250px]">
                        <p className="font-medium truncate">{query.subject}</p>
                        {query.orderId && (
                          <p className="text-xs text-muted-foreground">
                            Order: {query.orderId}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {typeLabels[query.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority.className}`}>
                        {priority.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={status.variant} className="gap-1">
                        {status.icon}
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDistanceToNow(new Date(query.createdAt), { addSuffix: true })}
                      </div>
                      {query.replies.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {query.replies.length} {query.replies.length === 1 ? 'reply' : 'replies'}
                        </p>
                      )}
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
                          <DropdownMenuItem onClick={() => onView(query)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onReply(query)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Reply
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <Clock className="mr-2 h-4 w-4" />
                              Change Status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {(Object.keys(statusLabels) as ContactStatus[]).map((status) => (
                                <DropdownMenuItem 
                                  key={status}
                                  onClick={() => handleStatusChange(query, status)}
                                  disabled={query.status === status}
                                >
                                  {statusLabels[status]}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(query)}
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

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact Query</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this query from {selectedQuery?.name}?
              <span className="block mt-2 font-medium">&quot;{selectedQuery?.subject}&quot;</span>
              <span className="block mt-2 text-red-600">
                This action cannot be undone. All replies will also be deleted.
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
