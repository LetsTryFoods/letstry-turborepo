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
  Edit, 
  MoreHorizontal, 
  Trash2,
  Eye,
  EyeOff,
  GripVertical
} from "lucide-react"
import { 
  FAQ, 
  FAQStatus,
  categoryLabels,
  useUpdateFAQ, 
  useDeleteFAQ 
} from "@/lib/faq/useFAQ"

interface FAQTableProps {
  faqs: FAQ[]
  onRefresh: () => void
  onEdit: (faq: FAQ) => void
}

const statusConfig: Record<FAQStatus, { label: string; variant: "default" | "secondary" }> = {
  ACTIVE: { label: "Active", variant: "default" },
  INACTIVE: { label: "Inactive", variant: "secondary" }
}

export default function FAQTable({ faqs, onRefresh, onEdit }: FAQTableProps) {
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)

  const { updateFAQ } = useUpdateFAQ()
  const { deleteFAQ } = useDeleteFAQ()

  const handleStatusToggle = (faq: FAQ) => {
    setSelectedFAQ(faq)
    setShowStatusDialog(true)
  }

  const handleDelete = (faq: FAQ) => {
    setSelectedFAQ(faq)
    setShowDeleteDialog(true)
  }

  const confirmStatusToggle = async () => {
    if (selectedFAQ) {
      const newStatus = selectedFAQ.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      await updateFAQ(selectedFAQ._id, { status: newStatus })
      onRefresh()
    }
    setShowStatusDialog(false)
    setSelectedFAQ(null)
  }

  const confirmDelete = async () => {
    if (selectedFAQ) {
      await deleteFAQ(selectedFAQ._id)
      onRefresh()
    }
    setShowDeleteDialog(false)
    setSelectedFAQ(null)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No FAQs found
                </TableCell>
              </TableRow>
            ) : (
              faqs.map((faq) => {
                const status = statusConfig[faq.status]
                return (
                  <TableRow key={faq._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        <span className="text-muted-foreground">{faq.order}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[400px]">
                        <p className="font-medium">{faq.question}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {faq.answer}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categoryLabels[faq.category]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
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
                          <DropdownMenuItem onClick={() => onEdit(faq)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusToggle(faq)}>
                            {faq.status === 'ACTIVE' ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(faq)}
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

      {/* Status Toggle Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedFAQ?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} FAQ
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {selectedFAQ?.status === 'ACTIVE' ? 'deactivate' : 'activate'} this FAQ?
              <span className="block mt-2 font-medium">&quot;{selectedFAQ?.question}&quot;</span>
              {selectedFAQ?.status === 'ACTIVE' ? (
                <span className="block mt-2 text-orange-600">
                  This FAQ will no longer be visible to customers.
                </span>
              ) : (
                <span className="block mt-2 text-green-600">
                  This FAQ will be visible to customers.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusToggle}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ?
              <span className="block mt-2 font-medium">&quot;{selectedFAQ?.question}&quot;</span>
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
