import { useState } from "react"
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress } from "@/lib/addresses/useAddresses"

export function useAddressPage() {
  // UI State
  const [selectedColumns, setSelectedColumns] = useState([
    "batchCode", "addressHeading", "subAddressHeading", "fssaiLicenseNumber", "isActive", "createdAt"
  ])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any | null>(null)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [addressToDelete, setAddressToDelete] = useState<{ id: string; batchCode: string } | null>(null)

  // API Hooks
  const { data: addressesData, loading: addressesLoading, error: addressesError } = useAddresses({ page: currentPage, limit: pageSize })
  const { mutate: createAddress, loading: createLoading } = useCreateAddress()
  const { mutate: updateAddress, loading: updateLoading } = useUpdateAddress()
  const { mutate: deleteAddress, loading: deleteLoading } = useDeleteAddress()

  // Derived Data
  const addresses = (addressesData as any)?.manufacturingAddresses?.items || []
  const meta = (addressesData as any)?.manufacturingAddresses?.meta || {
    totalCount: 0,
    page: 1,
    limit: pageSize,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  }

  // Handlers
  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    )
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleDelete = (addressId: string, batchCode: string) => {
    setAddressToDelete({ id: addressId, batchCode })
    setDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (addressToDelete) {
      try {
        await deleteAddress({
          variables: { id: addressToDelete.id }
        })
        setAddressToDelete(null)
      } catch (error) {
        console.error('Failed to delete address:', error)
      }
    }
    setDeleteAlertOpen(false)
  }

  const handleEdit = (addressId: string) => {
    const address = addresses.find((a: any) => a._id === addressId)
    if (address) {
      setEditingAddress(address)
      setIsDialogOpen(true)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingAddress(null)
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    setIsDialogOpen(true)
  }

  const handleActiveToggle = async (addressId: string, currentActive: boolean) => {
    try {
      await updateAddress({
        variables: {
          id: addressId,
          input: {
            isActive: !currentActive
          }
        }
      })
    } catch (error) {
      console.error('Failed to toggle address active status:', error)
    }
  }

  return {
    state: {
      selectedColumns,
      currentPage,
      pageSize,
      isDialogOpen,
      editingAddress,
      deleteAlertOpen,
      addressToDelete,
      addresses,
      meta,
      addressesLoading,
      addressesError,
      createLoading,
      updateLoading,
      deleteLoading
    },
    actions: {
      setSelectedColumns,
      setIsDialogOpen,
      setDeleteAlertOpen,
      handleColumnToggle,
      handlePageChange,
      handleDelete,
      handleDeleteConfirm,
      handleEdit,
      handleCloseDialog,
      handleAddAddress,
      handleActiveToggle,
      createAddress,
      updateAddress
    }
  }
}
