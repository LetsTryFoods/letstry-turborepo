import { useState } from "react"
import { useCategories, useCreateCategory, useUpdateCategory, useArchiveCategory, useUnarchiveCategory } from "@/lib/categories/useCategories"

export function useCategoryPage() {
  // UI State
  const [selectedColumns, setSelectedColumns] = useState([
    "name", "slug", "codeValue", "productCount", "isArchived", "createdAt"
  ])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [categoryToArchive, setCategoryToArchive] = useState<{ _id: string; isArchived: boolean } | null>(null)
  const [imagePreview, setImagePreview] = useState<{ url: string; title: string } | null>(null)
  const [includeArchived, setIncludeArchived] = useState(false)

  // API Hooks
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useCategories({ page: currentPage, limit: pageSize }, includeArchived)
  const { mutate: createCategory, loading: createLoading } = useCreateCategory()
  const { mutate: updateCategory, loading: updateLoading } = useUpdateCategory()
  const { mutate: archiveCategory, loading: archiveLoading } = useArchiveCategory()
  const { mutate: unarchiveCategory, loading: unarchiveLoading } = useUnarchiveCategory()

  // Derived Data
  const categories = (categoriesData as any)?.categories?.items || []
  const meta = (categoriesData as any)?.categories?.meta || {
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

  const handleArchiveToggle = (categoryId: string, isCurrentlyArchived: boolean) => {
    setCategoryToArchive({ _id: categoryId, isArchived: isCurrentlyArchived })
    setDeleteAlertOpen(true)
  }

  const handleArchiveConfirm = async () => {
    if (categoryToArchive) {
      try {
        if (categoryToArchive.isArchived) {
          await unarchiveCategory({
            variables: { _id: categoryToArchive._id }
          })
        } else {
          await archiveCategory({
            variables: { _id: categoryToArchive._id }
          })
        }
        setCategoryToArchive(null)
      } catch (error) {
        console.error('Failed to toggle category archive status:', error)
      }
    }
    setDeleteAlertOpen(false)
  }

  const handleFavouriteToggle = async (categoryId: string, currentFavourite: boolean) => {
    try {
      await updateCategory({
        variables: {
          _id: categoryId,
          input: {
            favourite: !currentFavourite
          }
        }
      })
    } catch (error) {
      console.error('Failed to toggle category favourite status:', error)
    }
  }

  const handleEdit = (categoryId: string) => {
    const category = categories.find((c: any) => c._id === categoryId)
    if (category) {
      setEditingCategory(category)
      setIsDialogOpen(true)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCategory(null)
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setIsDialogOpen(true)
  }

  const handleImagePreview = (url: string, title: string) => {
    setImagePreview({ url, title })
  }

  return {
    state: {
      selectedColumns,
      currentPage,
      pageSize,
      isDialogOpen,
      editingCategory,
      deleteAlertOpen,
      categoryToArchive,
      imagePreview,
      includeArchived,
      categories,
      meta,
      categoriesLoading,
      categoriesError,
      createLoading,
      updateLoading,
      archiveLoading,
      unarchiveLoading
    },
    actions: {
      setSelectedColumns,
      setIncludeArchived,
      setIsDialogOpen,
      setDeleteAlertOpen,
      setImagePreview,
      handleColumnToggle,
      handlePageChange,
      handleArchiveToggle,
      handleArchiveConfirm,
      handleFavouriteToggle,
      handleEdit,
      handleCloseDialog,
      handleAddCategory,
      handleImagePreview,
      createCategory,
      updateCategory
    }
  }
}
