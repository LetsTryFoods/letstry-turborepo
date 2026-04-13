import { useState } from 'react'
import {
  useLandingPages,
  useCreateLandingPage,
  useUpdateLandingPage,
  useUpdateLandingPageActive,
  useDeleteLandingPage,
} from '@/lib/landing-pages/useLandingPages'

export function useLandingPagePage() {
  const [selectedColumns, setSelectedColumns] = useState([
    'title', 'slug', 'isActive', 'position', 'createdAt',
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<any | null>(null)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<string | null>(null)
  const [seoDialogOpen, setSeoDialogOpen] = useState(false)
  const [seoTargetPage, setSeoTargetPage] = useState<any | null>(null)

  const { data: pagesData, loading: pagesLoading, error: pagesError } = useLandingPages()
  const { mutate: createLandingPage } = useCreateLandingPage()
  const { mutate: updateLandingPage } = useUpdateLandingPage()
  const { mutate: updateLandingPageActive } = useUpdateLandingPageActive()
  const { mutate: deleteLandingPage } = useDeleteLandingPage()

  const landingPages = (pagesData as any)?.landingPages || []

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    )
  }

  const handleToggleActive = async (pageId: string) => {
    const page = landingPages.find((p: any) => p._id === pageId)
    if (page) {
      try {
        await updateLandingPageActive({ variables: { id: pageId, isActive: !page.isActive } })
      } catch {}
    }
  }

  const handleDeleteClick = (pageId: string) => {
    setPageToDelete(pageId)
    setDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (pageToDelete) {
      try {
        await deleteLandingPage({ variables: { id: pageToDelete } })
        setPageToDelete(null)
      } catch {}
    }
    setDeleteAlertOpen(false)
  }

  const handleEdit = (pageId: string) => {
    const page = landingPages.find((p: any) => p._id === pageId)
    if (page) {
      setEditingPage(page)
      setIsDialogOpen(true)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingPage(null)
  }

  const handleAddPage = () => {
    setEditingPage(null)
    setIsDialogOpen(true)
  }

  const handleSeoClick = (pageId: string) => {
    const page = landingPages.find((p: any) => p._id === pageId)
    if (page) {
      setSeoTargetPage(page)
      setSeoDialogOpen(true)
    }
  }

  const handleSeoSave = async (seoData: any) => {
    if (seoTargetPage) {
      await updateLandingPage({ variables: { id: seoTargetPage._id, input: { seo: seoData } } })
    }
  }

  return {
    landingPages,
    pagesLoading,
    pagesError,
    createLandingPage,
    updateLandingPage,
    selectedColumns,
    handleColumnToggle,
    isDialogOpen,
    setIsDialogOpen,
    editingPage,
    handleEdit,
    handleCloseDialog,
    handleAddPage,
    deleteAlertOpen,
    setDeleteAlertOpen,
    handleDeleteClick,
    handleDeleteConfirm,
    handleToggleActive,
    seoDialogOpen,
    setSeoDialogOpen,
    seoTargetPage,
    handleSeoClick,
    handleSeoSave,
  }
}
