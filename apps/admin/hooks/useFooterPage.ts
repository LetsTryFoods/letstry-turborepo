import { useState } from "react"
import { useFooterDetails, useCreateFooterDetail, useUpdateFooterDetail, useDeleteFooterDetail } from "@/lib/footer/useFooter"

export function useFooterPage() {
  // UI State
  const [selectedColumns, setSelectedColumns] = useState([
    "logoUrl", "companyName", "email", "phone", "socialMediaLinks", "isActive"
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFooter, setEditingFooter] = useState<any | null>(null)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [footerToDelete, setFooterToDelete] = useState<{ id: string; companyName: string } | null>(null)

  // API Hooks
  const { data: footerData, loading: footerLoading, error: footerError } = useFooterDetails()
  const { mutate: createFooter, loading: createLoading } = useCreateFooterDetail()
  const { mutate: updateFooter, loading: updateLoading } = useUpdateFooterDetail()
  const { mutate: deleteFooter, loading: deleteLoading } = useDeleteFooterDetail()

  // Derived Data
  const footerDetails = (footerData as any)?.footerDetails || []

  // Handlers
  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    )
  }

  const handleDelete = (footerId: string, companyName: string) => {
    setFooterToDelete({ id: footerId, companyName })
    setDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (footerToDelete) {
      try {
        await deleteFooter({
          variables: { id: footerToDelete.id }
        })
        setFooterToDelete(null)
      } catch (error) {
        console.error('Failed to delete footer detail:', error)
      }
    }
    setDeleteAlertOpen(false)
  }

  const handleEdit = (footerId: string) => {
    const footer = footerDetails.find((f: any) => f._id === footerId)
    if (footer) {
      setEditingFooter(footer)
      setIsDialogOpen(true)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingFooter(null)
  }

  const handleAddFooter = () => {
    setEditingFooter(null)
    setIsDialogOpen(true)
  }

  const handleActiveToggle = async (footerId: string, currentActive: boolean) => {
    try {
      await updateFooter({
        variables: {
          id: footerId,
          input: {
            isActive: !currentActive
          }
        }
      })
    } catch (error) {
      console.error('Failed to toggle footer active status:', error)
    }
  }

  return {
    state: {
      selectedColumns,
      isDialogOpen,
      editingFooter,
      deleteAlertOpen,
      footerToDelete,
      footerDetails,
      footerLoading,
      footerError,
      createLoading,
      updateLoading,
      deleteLoading
    },
    actions: {
      setSelectedColumns,
      setIsDialogOpen,
      setDeleteAlertOpen,
      handleColumnToggle,
      handleDelete,
      handleDeleteConfirm,
      handleEdit,
      handleCloseDialog,
      handleAddFooter,
      handleActiveToggle,
      createFooter,
      updateFooter
    }
  }
}
