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
  CheckCircle, 
  XCircle, 
  Trash2,
  Star,
  ThumbsUp,
  ShieldCheck
} from "lucide-react"
import { 
  Review, 
  ReviewStatus, 
  useUpdateReviewStatus, 
  useDeleteReview 
} from "@/lib/reviews/useReviews"
import ReviewDetailsDialog from "./ReviewDetailsDialog"

interface ReviewTableProps {
  reviews: Review[]
  onRefresh: () => void
}

const statusConfig: Record<ReviewStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  PENDING: { label: "Pending", variant: "secondary" },
  APPROVED: { label: "Approved", variant: "default" },
  REJECTED: { label: "Rejected", variant: "destructive" }
}

export default function ReviewTable({ reviews, onRefresh }: ReviewTableProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<ReviewStatus | null>(null)

  const { updateStatus } = useUpdateReviewStatus()
  const { deleteReview } = useDeleteReview()

  const handleViewDetails = (review: Review) => {
    setSelectedReview(review)
    setShowDetailsDialog(true)
  }

  const handleStatusChange = (review: Review, status: ReviewStatus) => {
    setSelectedReview(review)
    setNewStatus(status)
    setShowStatusDialog(true)
  }

  const handleDeleteReview = (review: Review) => {
    setSelectedReview(review)
    setShowDeleteDialog(true)
  }

  const confirmStatusChange = async () => {
    if (selectedReview && newStatus) {
      await updateStatus(selectedReview._id, newStatus)
      onRefresh()
    }
    setShowStatusDialog(false)
    setSelectedReview(null)
    setNewStatus(null)
  }

  const confirmDelete = async () => {
    if (selectedReview) {
      await deleteReview(selectedReview._id)
      onRefresh()
    }
    setShowDeleteDialog(false)
    setSelectedReview(null)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Helpful</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No reviews found
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => {
                const status = statusConfig[review.status]
                return (
                  <TableRow key={review._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={review.productImage}
                          alt={review.productName}
                          className="h-10 w-10 rounded-md object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-product.png'
                          }}
                        />
                        <p className="font-medium text-sm max-w-[150px] truncate">
                          {review.productName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{review.customerName}</p>
                        {review.isVerifiedPurchase && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Verified Purchase
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderStars(review.rating)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="font-medium text-sm truncate">{review.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {review.comment}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{review.helpfulCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {format(new Date(review.createdAt), 'dd MMM yyyy')}
                      </p>
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
                          <DropdownMenuItem onClick={() => handleViewDetails(review)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          {review.status !== 'APPROVED' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(review, 'APPROVED')}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {review.status !== 'REJECTED' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(review, 'REJECTED')}>
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              Reject
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteReview(review)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Review
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

      {/* Review Details Dialog */}
      {selectedReview && (
        <ReviewDetailsDialog
          review={selectedReview}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteReview}
        />
      )}

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to <strong>{newStatus?.toLowerCase()}</strong> this review by{' '}
              <strong>{selectedReview?.customerName}</strong>?
              {newStatus === 'APPROVED' && (
                <span className="block mt-2 text-green-600">
                  This review will be visible to all customers on the product page.
                </span>
              )}
              {newStatus === 'REJECTED' && (
                <span className="block mt-2 text-red-600">
                  This review will not be visible to customers.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review by <strong>{selectedReview?.customerName}</strong>?
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
              Delete Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
