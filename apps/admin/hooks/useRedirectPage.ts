import { useState, useCallback, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { useRedirects, useCreateRedirect, useUpdateRedirect, useDeleteRedirect, Redirect } from '@/lib/redirects/useRedirects'

export const useRedirectPage = () => {
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [redirectToDelete, setRedirectToDelete] = useState<string | null>(null)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'fromPath',
    'toPath',
    'statusCode',
    'isActive',
    'source',
  ])

  const { data, loading, error, refetch } = useRedirects(page, limit, search)
  const { mutate: createRedirectMutation, loading: createLoading } = useCreateRedirect()
  const { mutate: updateRedirectMutation, loading: updateLoading } = useUpdateRedirect()
  const { mutate: deleteRedirectMutation, loading: deleteLoading } = useDeleteRedirect()

  const redirects = (data as any)?.redirects?.data || []
  const total = (data as any)?.redirects?.total || 0

  const handleColumnToggle = useCallback((column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column]
    )
  }, [])

  const handleEdit = useCallback((redirect: Redirect) => {
    setEditingRedirect(redirect)
    setIsDialogOpen(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false)
    setEditingRedirect(null)
  }, [])

  const handleAddRedirect = useCallback(() => {
    setEditingRedirect(null)
    setIsDialogOpen(true)
  }, [])

  const handleDeleteClick = useCallback((id: string) => {
    setRedirectToDelete(id)
    setDeleteAlertOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!redirectToDelete) return

    try {
      await deleteRedirectMutation({
        variables: { id: redirectToDelete },
      })
      toast.success('Redirect deleted successfully')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete redirect')
    } finally {
      setDeleteAlertOpen(false)
      setRedirectToDelete(null)
    }
  }, [redirectToDelete, deleteRedirectMutation, refetch])

  const createRedirect = useCallback(async (input: any) => {
    try {
      await createRedirectMutation({
        variables: { input },
      })
      toast.success('Redirect created successfully')
      await refetch()
      handleCloseDialog()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create redirect')
      throw error
    }
  }, [createRedirectMutation, refetch, handleCloseDialog])

  const updateRedirect = useCallback(async (id: string, input: any) => {
    try {
      await updateRedirectMutation({
        variables: { id, input },
      })
      toast.success('Redirect updated successfully')
      await refetch()
      handleCloseDialog()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update redirect')
      throw error
    }
  }, [updateRedirectMutation, refetch, handleCloseDialog])

  const handleToggleActive = useCallback(async (id: string, isActive: boolean) => {
    try {
      await updateRedirectMutation({
        variables: { id, input: { isActive } },
      })
      toast.success(`Redirect ${isActive ? 'activated' : 'deactivated'} successfully`)
      await refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update redirect')
    }
  }, [updateRedirectMutation, refetch])

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  return {
    redirects,
    total,
    page,
    limit,
    search,
    loading,
    error,
    isDialogOpen,
    setIsDialogOpen,
    editingRedirect,
    selectedColumns,
    deleteAlertOpen,
    setDeleteAlertOpen,
    handleColumnToggle,
    handleEdit,
    handleCloseDialog,
    handleAddRedirect,
    handleDeleteClick,
    handleDeleteConfirm,
    createRedirect,
    updateRedirect,
    handleToggleActive,
    handleSearch,
    setPage,
    refetch,
  }
}
