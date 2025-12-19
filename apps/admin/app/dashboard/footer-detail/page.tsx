'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useFooterPage } from "@/hooks/useFooterPage"
import { ColumnSelector, ColumnDefinition } from "@/app/dashboard/components/column-selector"
import { FooterForm } from "./components/FooterForm"
import { FooterTable } from "./components/FooterTable"
import { DeleteFooterDialog } from "./components/DeleteFooterDialog"

// Define all columns
const allColumns: ColumnDefinition[] = [
    { key: "logoUrl", label: "Logo" },
    { key: "companyName", label: "Company Name" },
    { key: "cin", label: "CIN" },
    { key: "address", label: "Address" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "exportEmail", label: "Export Email" },
    { key: "socialMediaTitle", label: "Social Title" },
    { key: "socialMediaLinks", label: "Social Links" },
    { key: "isActive", label: "Active" },
]

export default function FooterDetailPage() {
    const { state, actions } = useFooterPage()

    return (
        <div className="flex flex-col gap-4 mx-4 auto">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle>Footer Details</CardTitle>
                        <CardDescription>Manage website footer contact information and social links</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <ColumnSelector
                            allColumns={allColumns}
                            selectedColumns={state.selectedColumns}
                            onColumnToggle={actions.handleColumnToggle}
                        />
                        <Button onClick={actions.handleAddFooter}>
                            <Plus className="mr-2 h-4 w-4" /> Add Footer Detail
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <FooterTable
                        footerDetails={state.footerDetails}
                        selectedColumns={state.selectedColumns}
                        allColumns={allColumns}
                        loading={state.footerLoading}
                        error={state.footerError}
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
                        <DialogTitle>{state.editingFooter ? 'Edit' : 'Add'} Footer Detail</DialogTitle>
                        <DialogDescription>
                            {state.editingFooter 
                                ? 'Update the footer contact information below.' 
                                : 'Add a new footer configuration with contact details and social links.'}
                        </DialogDescription>
                    </DialogHeader>
                    <FooterForm 
                        onClose={actions.handleCloseDialog}
                        initialData={state.editingFooter}
                        createFooter={actions.createFooter}
                        updateFooter={actions.updateFooter}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <DeleteFooterDialog
                open={state.deleteAlertOpen}
                onOpenChange={actions.setDeleteAlertOpen}
                footerToDelete={state.footerToDelete}
                onConfirm={actions.handleDeleteConfirm}
            />
        </div>
    )
}