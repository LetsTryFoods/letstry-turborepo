import { useState } from "react"
import { useBanners, useCreateBanner, useUpdateBanner, useUpdateBannerActive, useDeleteBanner } from "@/lib/banners/useBanners"

export function useBannerPage() {
  const [selectedColumns, setSelectedColumns] = useState([
    "name", "headline", "isActive", "position", "createdAt"
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<any | null>(null)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<{ url: string; title: string } | null>(null)

  // API hooks
  const { data: bannersData, loading: bannersLoading, error: bannersError } = useBanners()
  const { mutate: createBanner } = useCreateBanner()
  const { mutate: updateBanner } = useUpdateBanner()
  const { mutate: updateBannerActive } = useUpdateBannerActive()
  const { mutate: deleteBanner } = useDeleteBanner()

  const banners = (bannersData as any)?.banners || []

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    )
  }

  const handleToggleActive = async (bannerId: string) => {
    const banner = banners.find((b: any) => b._id === bannerId)
    if (banner) {
      try {
        await updateBannerActive({
          variables: {
            id: bannerId,
            isActive: !banner.isActive
          }
        })
      } catch (error) {
        console.error('Failed to toggle banner active status:', error)
      }
    }
  }

  const handleDeleteClick = (bannerId: string) => {
    setBannerToDelete(bannerId)
    setDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (bannerToDelete) {
      try {
        await deleteBanner({
          variables: {
            id: bannerToDelete
          }
        })
        setBannerToDelete(null)
      } catch (error) {
        console.error('Failed to delete banner:', error)
      }
    }
    setDeleteAlertOpen(false)
  }

  const handleEdit = (bannerId: string) => {
    const banner = banners.find((b: any) => b._id === bannerId)
    if (banner) {
      setEditingBanner(banner)
      setIsDialogOpen(true)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingBanner(null)
  }

  const handleAddBanner = () => {
    setEditingBanner(null)
    setIsDialogOpen(true)
  }

  const handleImagePreview = (url: string, title: string) => {
    setImagePreview({ url, title })
  }

  return {
    banners,
    bannersLoading,
    bannersError,
    createBanner,
    updateBanner,
    selectedColumns,
    handleColumnToggle,
    isDialogOpen,
    setIsDialogOpen,
    editingBanner,
    handleEdit,
    handleCloseDialog,
    handleAddBanner,
    deleteAlertOpen,
    setDeleteAlertOpen,
    handleDeleteClick,
    handleDeleteConfirm,
    imagePreview,
    setImagePreview,
    handleToggleActive,
    handleImagePreview
  }
}
