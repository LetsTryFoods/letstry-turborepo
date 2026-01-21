'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useQuery, useLazyQuery, useMutation } from "@apollo/client/react"
import { GET_ALL_PACKERS } from "@/lib/graphql/packers"
import { GET_ALL_PACKING_ORDERS, CLEANUP_ORPHANED_JOBS } from "@/lib/graphql/packing"
import { GET_EVIDENCE_BY_ORDER } from "@/lib/graphql/packing"
import { Eye, Trash2 } from "lucide-react"

export default function PackingOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [packerFilter, setPackerFilter] = useState<string>('all')

  const { data: packersData } = useQuery(GET_ALL_PACKERS, {
    variables: { isActive: true },
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000,
  })

  const { data: ordersData, loading: ordersLoading } = useQuery(GET_ALL_PACKING_ORDERS, {
    variables: {
      packerId: packerFilter === 'all' ? undefined : packerFilter,
      status: statusFilter === 'all' ? undefined : statusFilter
    },
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000,
  })

  const [getEvidence, { data: evidenceData, loading: evidenceLoading }] = useLazyQuery(GET_EVIDENCE_BY_ORDER)

  const [cleanupJobs, { loading: cleanupLoading }] = useMutation(CLEANUP_ORPHANED_JOBS, {
    onCompleted: (data: any) => {
      alert(`Cleanup Complete: Removed ${data.cleanupOrphanedJobs.removed} orphaned jobs out of ${data.cleanupOrphanedJobs.checked} checked.`)
    },
    onError: (error) => {
      alert(`Cleanup Failed: ${error.message}`)
    },
    refetchQueries: [{ query: GET_ALL_PACKING_ORDERS, variables: { packerId: packerFilter === 'all' ? undefined : packerFilter, status: statusFilter === 'all' ? undefined : statusFilter } }],
  })

  const orders = (ordersData as any)?.getAllPackingOrders || []
  const packers = (packersData as any)?.getAllPackers || []
  const evidence = (evidenceData as any)?.getEvidenceByOrder

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      assigned: "default",
      packing: "outline",
      completed: "default",
      failed: "destructive"
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => cleanupJobs()}
                disabled={cleanupLoading}
                variant="outline"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {cleanupLoading ? "Cleaning..." : "Cleanup Queue"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Removes queue jobs for orders that no longer exist in the database</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex gap-4 items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="packing">Packing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={packerFilter} onValueChange={setPackerFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by packer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Packers</SelectItem>
            {packers.map((packer: any) => (
              <SelectItem key={packer.id} value={packer.id}>
                {packer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                    <TableCell>{order.packerName || 'Unassigned'}</TableCell>
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
        <DialogContent className="sm:max-w-[80vw] w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Order Number</p>
                      <p className="text-base font-semibold">{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                      <div>{getStatusBadge(selectedOrder.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Assigned To</p>
                      <p className="text-base font-semibold">{selectedOrder.packerName || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Assigned At</p>
                      <p className="text-base">{selectedOrder.assignedAt ? new Date(selectedOrder.assignedAt).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Priority</p>
                      <p className="text-base font-semibold">{selectedOrder.priority}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Items Count</p>
                      <p className="text-base font-semibold">{selectedOrder.items?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Express Delivery</p>
                      <Badge variant={selectedOrder.isExpress ? "default" : "secondary"}>
                        {selectedOrder.isExpress ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Has Errors</p>
                      <Badge variant={selectedOrder.hasErrors ? "destructive" : "secondary"}>
                        {selectedOrder.hasErrors ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Items ({selectedOrder.items.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-semibold min-w-[200px]">Product Name</TableHead>
                            <TableHead className="font-semibold min-w-[150px]">SKU</TableHead>
                            <TableHead className="font-semibold min-w-[180px]">EAN</TableHead>
                            <TableHead className="font-semibold text-right w-[100px]">Quantity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedOrder.items.map((item: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                              <TableCell className="text-muted-foreground font-mono text-sm break-all">{item.ean}</TableCell>
                              <TableCell className="text-right font-semibold">{item.quantity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Packing Evidence</CardTitle>
                </CardHeader>
                <CardContent>
                  {evidence ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Recommended Box</p>
                          <p className="text-base font-semibold">{evidence.recommendedBox?.code || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Actual Box</p>
                          <p className="text-base font-semibold">{evidence.actualBox?.code || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Box Mismatch</p>
                          <Badge variant={evidence.boxMismatch ? "destructive" : "secondary"}>
                            {evidence.boxMismatch ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>

                      {/* Evidence Images Section */}
                      <div className="mt-6 space-y-6">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-3">Pre-Pack Images ({evidence.prePackImages?.length || 0})</p>
                          {evidence.prePackImages && evidence.prePackImages.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {evidence.prePackImages.map((url: string, index: number) => (
                                <div
                                  key={`pre-${index}`}
                                  className="relative aspect-square rounded-md overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(url, '_blank')}
                                  title="Click to view full image"
                                >
                                  <img
                                    src={url}
                                    alt={`Pre-pack evidence ${index + 1}`}
                                    className="object-cover w-full h-full"
                                    loading="lazy"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No pre-pack images uploaded</p>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-3">Post-Pack Images ({evidence.postPackImages?.length || 0})</p>
                          {evidence.postPackImages && evidence.postPackImages.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {evidence.postPackImages.map((url: string, index: number) => (
                                <div
                                  key={`post-${index}`}
                                  className="relative aspect-square rounded-md overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(url, '_blank')}
                                  title="Click to view full image"
                                >
                                  <img
                                    src={url}
                                    alt={`Post-pack evidence ${index + 1}`}
                                    className="object-cover w-full h-full"
                                    loading="lazy"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No post-pack images uploaded</p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground italic">
                      No item evidence uploaded till now
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
