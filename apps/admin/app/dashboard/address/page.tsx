'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useAddressPage } from "@/hooks/useAddressPage"
import { ColumnSelector, ColumnDefinition } from "@/app/dashboard/components/column-selector"
import { AddressForm } from "./components/AddressForm"
import { AddressTable } from "./components/AddressTable"
import { DeleteAddressDialog } from "./components/DeleteAddressDialog"

// Define all columns
const allColumns: ColumnDefinition[] = [
    { key: "batchCode", label: "Batch Code" },
    { key: "addressHeading", label: "Company Name" },
    { key: "subAddressHeading", label: "Full Address" },
    { key: "fssaiLicenseNumber", label: "FSSAI License" },
    { key: "isActive", label: "Active" },
    { key: "createdAt", label: "Created At" },
]

export default function ManufacturingAddressPage() {
    const { state, actions } = useAddressPage()

    return (
        <div className="flex flex-col gap-4 mx-4 auto">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle>Manufacturing Unit Addresses</CardTitle>
                        <CardDescription>Manage manufacturing unit addresses with their details</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <ColumnSelector
                            allColumns={allColumns}
                            selectedColumns={state.selectedColumns}
                            onColumnToggle={actions.handleColumnToggle}
                        />
                        <Button onClick={actions.handleAddAddress}>
                            <Plus className="mr-2 h-4 w-4" /> Add Address
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <AddressTable
                        addresses={state.addresses}
                        selectedColumns={state.selectedColumns}
                        allColumns={allColumns}
                        loading={state.addressesLoading}
                        error={state.addressesError}
                        meta={state.meta}
                        onPageChange={actions.handlePageChange}
                        onActiveToggle={actions.handleActiveToggle}
                        onEdit={actions.handleEdit}
                        onDelete={actions.handleDelete}
                    />
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={state.isDialogOpen} onOpenChange={actions.setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{state.editingAddress ? 'Edit' : 'Add'} Manufacturing Address</DialogTitle>
                        <DialogDescription>
                            {state.editingAddress 
                                ? 'Update the manufacturing address details below.' 
                                : 'Add a new manufacturing unit address with FSSAI details.'}
                        </DialogDescription>
                    </DialogHeader>
                    <AddressForm 
                        onClose={actions.handleCloseDialog}
                        initialData={state.editingAddress}
                        createAddress={actions.createAddress}
                        updateAddress={actions.updateAddress}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <DeleteAddressDialog
                open={state.deleteAlertOpen}
                onOpenChange={actions.setDeleteAlertOpen}
                addressToDelete={state.addressToDelete}
                onConfirm={actions.handleDeleteConfirm}
            />
        </div>
    )
}