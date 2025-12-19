"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Copy } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Coupon } from "@/lib/coupons/useCoupons"
import { format } from "date-fns"

interface CouponTableProps {
  coupons: Coupon[]
  onDelete: (coupon: Coupon) => void
}

export function CouponTable({ coupons, onDelete }: CouponTableProps) {
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const isExpired = (endDate: string) => new Date(endDate) < new Date()
  const isUpcoming = (startDate: string) => new Date(startDate) > new Date()

  // const getStatusBadge = (coupon: Coupon) => {
  //   if (!coupon.isActive) {
  //     return <Badge variant="secondary">Inactive</Badge>
  //   }
  //   if (isExpired(coupon.endDate)) {
  //     return <Badge variant="destructive">Expired</Badge>
  //   }
  //   if (isUpcoming(coupon.startDate)) {
  //     return <Badge variant="outline">Upcoming</Badge>
  //   }
  //   return <Badge variant="default" className="bg-green-600">Active</Badge>
  // }

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}%`
    }
    return `₹${coupon.discountValue}`
  }

  // const getEligibilityBadge = (type: string) => {
  //   switch (type) {
  //     case 'ALL':
  //       return <Badge variant="outline">All Users</Badge>
  //     case 'FIRST_ORDER':
  //       return <Badge variant="outline" className="border-blue-500 text-blue-500">First Order</Badge>
  //     case 'SPECIFIC_USERS':
  //       return <Badge variant="outline" className="border-purple-500 text-purple-500">Specific Users</Badge>
  //     default:
  //       return <Badge variant="outline">{type}</Badge>
  //   }
  // }

  if (coupons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <p className="text-muted-foreground">No coupons found</p>
        <p className="text-sm text-muted-foreground">Create your first coupon to get started</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Eligibility</TableHead>
            {/* <TableHead>Usage</TableHead>
            <TableHead>Validity</TableHead> */}
            {/* <TableHead>Status</TableHead> */}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon._id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {coupon.code}
                  </code>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyCode(coupon.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy code</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{coupon.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {coupon.description}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-semibold text-green-600">{getDiscountDisplay(coupon)}</p>
                  {coupon.minCartValue && (
                    <p className="text-xs text-muted-foreground">
                      Min: ₹{coupon.minCartValue}
                    </p>
                  )}
                  {coupon.maxDiscountAmount && coupon.discountType === 'PERCENTAGE' && (
                    <p className="text-xs text-muted-foreground">
                      Max: ₹{coupon.maxDiscountAmount}
                    </p>
                  )}
                </div>
              </TableCell>
              {/* <TableCell>
                {getEligibilityBadge(coupon.eligibilityType)}
              </TableCell> */}
              {/* <TableCell>
                <div className="text-sm">
                  <p>{coupon.usageCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}</p>
                  <p className="text-xs text-muted-foreground">
                    {coupon.usageLimit ? 'Limited' : 'Unlimited'}
                  </p>
                </div>
              </TableCell> */}
              <TableCell>
                <div className="text-xs">
                  <p>{format(new Date(coupon.startDate), 'dd MMM yyyy')}</p>
                  <p className="text-muted-foreground">to</p>
                  <p>{format(new Date(coupon.endDate), 'dd MMM yyyy')}</p>
                </div>
              </TableCell>
              {/* <TableCell>
                {getStatusBadge(coupon)}
              </TableCell> */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onDelete(coupon)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete coupon</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
