import { useState, useEffect } from "react"
import { usePackers, useCreatePacker, useUpdatePacker, useDeletePacker } from "@/lib/packers/usePackers"

export function usePackerPage() {
  const [selectedColumns, setSelectedColumns] = useState([
    "employeeId", "name", "phone", "email", "totalOrdersPacked", "accuracyRate", "isActive", "assignedOrders", "inProgressOrders", "completedOrders"
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPacker, setEditingPacker] = useState<any | null>(null)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [packerToDelete, setPackerToDelete] = useState<string | null>(null)
  const [statsDialogOpen, setStatsDialogOpen] = useState(false)
  const [selectedPackerId, setSelectedPackerId] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  const { data: packersData, loading: packersLoading, error: packersError, refetch: refetchPackers } = usePackers(showInactive ? false : undefined)
  const { mutate: createPacker } = useCreatePacker()
  const { mutate: updatePacker } = useUpdatePacker()
  const { mutate: deletePacker } = useDeletePacker()

  const packers = (packersData as any)?.getAllPackers || []

  useEffect(() => {
    refetchPackers()
  }, [showInactive, refetchPackers])

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    )
  }

  const handleAddPacker = () => {
    setEditingPacker(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (packer: any) => {
    setEditingPacker(packer)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingPacker(null)
  }

  const handleDelete = (packerId: string) => {
    setPackerToDelete(packerId)
    setDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (packerToDelete) {
      try {
        await deletePacker({
          variables: { _id: packerToDelete }
        })
        setPackerToDelete(null)
      } catch (error) {
        console.error('Failed to delete packer:', error)
      }
    }
    setDeleteAlertOpen(false)
  }

  const handleToggleActive = async (packerId: string, currentActive: boolean) => {
    try {
      await updatePacker({
        variables: {
          _id: packerId,
          input: {
            isActive: !currentActive
          }
        }
      })
    } catch (error) {
      console.error('Failed to toggle packer status:', error)
    }
  }

  const handleViewStats = (packerId: string) => {
    setSelectedPackerId(packerId)
    setStatsDialogOpen(true)
  }

  return {
    state: {
      selectedColumns,
      isDialogOpen,
      editingPacker,
      deleteAlertOpen,
      packerToDelete,
      statsDialogOpen,
      selectedPackerId,
      showInactive,
      packers,
      packersLoading,
      packersError,
    },
    actions: {
      handleColumnToggle,
      handleAddPacker,
      handleEdit,
      handleCloseDialog,
      handleDelete,
      handleDeleteConfirm,
      handleToggleActive,
      handleViewStats,
      setShowInactive,
      setIsDialogOpen,
      setDeleteAlertOpen,
      setStatsDialogOpen,
      createPacker,
      updatePacker,
      refetchPackers,
    }
  }
}
