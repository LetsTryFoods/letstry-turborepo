'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePackerStats } from "@/lib/packers/usePackers"

interface PackerStatsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  packerId: string | null
}

export function PackerStatsDialog({ open, onOpenChange, packerId }: PackerStatsDialogProps) {
  const { data: statsData, loading } = usePackerStats(packerId || "")

  const stats = (statsData as any)?.getPackerStats

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Packer Statistics</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading statistics...</p>
          </div>
        ) : stats ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Total Orders</CardTitle>
                <CardDescription>All time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders Today</CardTitle>
                <CardDescription>Packed today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.ordersPackedToday}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accuracy Rate</CardTitle>
                <CardDescription>Current performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.accuracyRate === 0 && stats.totalOrders === 0 ? 'No orders packed' : `${stats.accuracyRate.toFixed(2)}%`}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg Pack Time</CardTitle>
                <CardDescription>Per order (seconds)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averagePackTime.toFixed(0)}s</div>
              </CardContent>
            </Card>

            {stats.errorsByType && stats.errorsByType.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Errors by Type</CardTitle>
                  <CardDescription>Error breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.errorsByType.map((error: any) => (
                      <div key={error.errorType} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{error.errorType}</span>
                        <span className="text-sm text-muted-foreground">{error.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No statistics available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
