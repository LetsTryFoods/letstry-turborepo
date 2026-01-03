'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnSelector, ColumnDefinition } from "../components/column-selector"
import { usePackerPage } from "@/hooks/usePackerPage"
import { PackerForm } from "./components/PackerForm"
import { PackerTable } from "./components/PackerTable"
import { DeleteDialog } from "./components/DeleteDialog"
import { PackerStatsDialog } from "./components/PackerStatsDialog"
import { PasswordDisplayDialog } from "./components/PasswordDisplayDialog"
import { useQuery } from "@apollo/client/react"
import { GET_ALL_PACKING_ORDERS } from "@/lib/graphql/packing"

const allColumns: ColumnDefinition[] = [
  { key: "employeeId", label: "Employee ID" },
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "isActive", label: "Active" },
  { key: "totalOrdersPacked", label: "Orders Packed" },
  { key: "accuracyRate", label: "Accuracy Rate" },
  { key: "averagePackTime", label: "Avg Pack Time" },
  { key: "lastActiveAt", label: "Last Active" },
  { key: "assignedOrders", label: "Assigned" },
  { key: "inProgressOrders", label: "In Progress" },
  { key: "completedOrders", label: "Completed" },
]

export default function PackersPage() {
  const { state, actions } = usePackerPage()
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [createdPacker, setCreatedPacker] = useState<any>(null)
  const [generatedPassword, setGeneratedPassword] = useState<string>('')

  const { data: ordersData } = useQuery(GET_ALL_PACKING_ORDERS, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000,
  })

  const orders = (ordersData as any)?.getAllPackingOrders || []

  const orderCounts = orders.reduce((acc: Record<string, { assigned: number; inProgress: number; completed: number }>, order: any) => {
    if (!order.assignedTo) return acc
    if (!acc[order.assignedTo]) {
      acc[order.assignedTo] = { assigned: 0, inProgress: 0, completed: 0 }
    }
    if (order.status === 'assigned') acc[order.assignedTo].assigned++
    else if (order.status === 'packing') acc[order.assignedTo].inProgress++
    else if (order.status === 'completed') acc[order.assignedTo].completed++
    return acc
  }, {})

  const handlePackerCreated = (packer: any, password: string) => {
    setCreatedPacker(packer)
    setGeneratedPassword(password)
    setPasswordDialogOpen(true)
    // Refetch packers to update the list
    actions.refetchPackers()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Packers</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-inactive"
              checked={state.showInactive}
              onCheckedChange={(checked) => actions.setShowInactive(checked as boolean)}
            />
            <label
              htmlFor="show-inactive"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show Inactive
            </label>
          </div>
          <Dialog open={state.isDialogOpen} onOpenChange={actions.setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={actions.handleAddPacker}>Add Packer</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{state.editingPacker ? 'Edit Packer' : 'Add New Packer'}</DialogTitle>
              </DialogHeader>
              <PackerForm 
                onClose={actions.handleCloseDialog} 
                initialData={state.editingPacker}
                createPacker={actions.createPacker}
                updatePacker={actions.updatePacker}
                onPackerCreated={handlePackerCreated}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        <ColumnSelector
          allColumns={allColumns}
          selectedColumns={state.selectedColumns}
          onColumnToggle={actions.handleColumnToggle}
        />

        <div className="rounded-md border">
          <PackerTable
            packers={state.packers}
            selectedColumns={state.selectedColumns}
            allColumns={allColumns}
            loading={state.packersLoading}
            error={state.packersError}
            onEdit={actions.handleEdit}
            onDelete={actions.handleDelete}
            onToggleActive={actions.handleToggleActive}
            onViewStats={actions.handleViewStats}
            orderCounts={orderCounts}
          />
        </div>
      </div>

      <DeleteDialog
        open={state.deleteAlertOpen}
        onOpenChange={actions.setDeleteAlertOpen}
        packerToDelete={state.packerToDelete}
        onConfirm={actions.handleDeleteConfirm}
      />

      <PackerStatsDialog
        open={state.statsDialogOpen}
        onOpenChange={actions.setStatsDialogOpen}
        packerId={state.selectedPackerId}
      />

      <PasswordDisplayDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        packer={createdPacker}
        password={generatedPassword}
      />
    </div>
  )
}
