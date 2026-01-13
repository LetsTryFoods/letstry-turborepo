import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { ShipmentStatusCode } from '@/lib/shipments/types'

interface ShipmentFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  dateRange: { from?: Date; to?: Date }
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void
  onClearFilters: () => void
}

export function ShipmentFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  onClearFilters,
}: ShipmentFiltersProps) {
  const hasFilters = searchTerm || statusFilter !== 'ALL' || dateRange.from || dateRange.to

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by AWB, Order ID, Customer Code..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value={ShipmentStatusCode.BKD}>Booked</SelectItem>
          <SelectItem value={ShipmentStatusCode.PUP}>Picked Up</SelectItem>
          <SelectItem value={ShipmentStatusCode.ITM}>In Transit</SelectItem>
          <SelectItem value={ShipmentStatusCode.OFD}>Out for Delivery</SelectItem>
          <SelectItem value={ShipmentStatusCode.DLV}>Delivered</SelectItem>
          <SelectItem value={ShipmentStatusCode.NONDLV}>Not Delivered</SelectItem>
          <SelectItem value={ShipmentStatusCode.RTO}>RTO</SelectItem>
          <SelectItem value={ShipmentStatusCode.CAN}>Cancelled</SelectItem>
          <SelectItem value={ShipmentStatusCode.HLD}>On Hold</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Input
          type="date"
          placeholder="From Date"
          value={dateRange.from ? new Date(dateRange.from).toISOString().split('T')[0] : ''}
          onChange={(e) =>
            onDateRangeChange({
              from: e.target.value ? new Date(e.target.value) : undefined,
              to: dateRange.to,
            })
          }
          className="w-full sm:w-[160px]"
        />
        <Input
          type="date"
          placeholder="To Date"
          value={dateRange.to ? new Date(dateRange.to).toISOString().split('T')[0] : ''}
          onChange={(e) =>
            onDateRangeChange({
              from: dateRange.from,
              to: e.target.value ? new Date(e.target.value) : undefined,
            })
          }
          className="w-full sm:w-[160px]"
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" onClick={onClearFilters} size="icon">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
