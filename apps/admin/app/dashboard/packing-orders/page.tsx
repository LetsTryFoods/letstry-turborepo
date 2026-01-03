'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useQuery } from "@apollo/client/react"
import { GET_ALL_PACKERS } from "@/lib/graphql/packers"
import { GET_ALL_PACKING_ORDERS } from "@/lib/graphql/packing"
import { Eye } from "lucide-react"
import { useLazyQuery } from "@apollo/client/react"
import { GET_EVIDENCE_BY_ORDER } from "@/lib/graphql/packing"

export default function PackingOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const { data: packersData } = useQuery(GET_ALL_PACKERS, {
    variables: { isActive: true },
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000,
  })

  const { data: ordersData, loading: ordersLoading } = useQuery(GET_ALL_PACKING_ORDERS, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000,
  })

  const [getEvidence, { data: evidenceData, loading: evidenceLoading }] = useLazyQuery(GET_EVIDENCE_BY_ORDER)

  const orders = (ordersData as any)?.getAllPackingOrders || []
  const evidence = (evidenceData as any)?.getEvidenceByOrder

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      online: "default",
      offline: "secondary",
      busy: "outline"
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order)
    getEvidence({ variables: { packingOrderId: order.id } })
    setIsDetailsOpen(true)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Packing Orders</h2>
          <p className="text-muted-foreground">Monitor active packing operations</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o: any) => o.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Waiting for assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o: any) => o.status === 'assigned').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Assigned to packers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o: any) => o.status === 'packing').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently being packed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o: any) => o.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Finished packing
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Packing Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{order.assignedTo || 'Unassigned'}</TableCell>
                    <TableCell>{order.priority}</TableCell>
                    <TableCell>{order.items?.length || 0}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Number</p>
                  <p className="text-lg">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-lg">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                  <p className="text-lg">{selectedOrder.assignedTo || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <p className="text-lg">{selectedOrder.priority}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Items Count</p>
                  <p className="text-lg">{selectedOrder.items?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Has Errors</p>
                  <p className="text-lg">{selectedOrder.hasErrors ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Express</p>
                  <p className="text-lg">{selectedOrder.isExpress ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assigned At</p>
                  <p className="text-lg">{selectedOrder.assignedAt ? new Date(selectedOrder.assignedAt).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
              {evidence && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4">Packing Evidence</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Recommended Box</p>
                      <p className="text-lg">{evidence.recommendedBox?.code || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Actual Box</p>
                      <p className="text-lg">{evidence.actualBox?.code || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Box Mismatch</p>
                      <p className="text-lg">{evidence.boxMismatch ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pre-Pack Images</p>
                      <p className="text-lg">{evidence.prePackImages?.length || 0}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
