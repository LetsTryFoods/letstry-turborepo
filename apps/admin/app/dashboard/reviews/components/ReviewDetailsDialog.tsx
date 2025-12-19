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
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Star,
  ThumbsUp,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Trash2,
  Calendar,
  User,
  Mail,
  Package
} from "lucide-react"
import { Review, ReviewStatus } from "@/lib/reviews/useReviews"

interface ReviewDetailsDialogProps {
  review: Review
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (review: Review, status: ReviewStatus) => void
  onDelete: (review: Review) => void
}

const statusConfig: Record<ReviewStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  PENDING: { label: "Pending", variant: "secondary" },
  APPROVED: { label: "Approved", variant: "default" },
  REJECTED: { label: "Rejected", variant: "destructive" }
}

export default function ReviewDetailsDialog({
  review,
  open,
  onOpenChange,
  onStatusChange,
  onDelete
}: ReviewDetailsDialogProps) {
  const status = statusConfig[review.status]

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-lg font-semibold">{rating}/5</span>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Details</DialogTitle>
          <DialogDescription>
            Complete review information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <img
                  src={review.productImage}
                  alt={review.productName}
                  className="h-16 w-16 rounded-md object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-product.png'
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Product</span>
                  </div>
                  <p className="font-semibold">{review.productName}</p>
                </div>
                <Badge variant={status.variant} className="text-sm">
                  {status.label}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{review.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{review.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* Verification & Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {review.isVerifiedPurchase && (
                <div className="flex items-center gap-1 text-green-600">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-sm font-medium">Verified Purchase</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-muted-foreground">
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm">{review.helpfulCount} found helpful</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {format(new Date(review.createdAt), 'dd MMM yyyy, hh:mm a')}
              </span>
            </div>
          </div>

          <Separator />

          {/* Rating */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Rating</p>
            {renderStars(review.rating)}
          </div>

          {/* Review Content */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Review Title</p>
            <p className="font-semibold text-lg">{review.title}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Review Comment</p>
            <p className="text-sm leading-relaxed">{review.comment}</p>
          </div>

          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Attached Images ({review.images.length})
              </p>
              <div className="flex gap-2 flex-wrap">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="h-24 w-24 rounded-md object-cover border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.png'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-2">Actions:</span>
            {review.status !== 'APPROVED' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  onStatusChange(review, 'APPROVED')
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Approve
              </Button>
            )}
            {review.status !== 'REJECTED' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  onStatusChange(review, 'REJECTED')
                }}
              >
                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                Reject
              </Button>
            )}
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onDelete(review)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
