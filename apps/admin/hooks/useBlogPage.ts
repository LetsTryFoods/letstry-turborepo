import { useState } from "react"
import { useBlogs, useCreateBlog, useUpdateBlog, useDeleteBlog } from "@/lib/blogs/useBlogs"

export function useBlogPage() {
    const [selectedColumns, setSelectedColumns] = useState([
        "title", "author", "category", "isActive", "position", "date"
    ])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingBlog, setEditingBlog] = useState<any | null>(null)
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
    const [blogToDelete, setBlogToDelete] = useState<string | null>(null)
    const [imagePreview, setImagePreview] = useState<{ url: string; title: string } | null>(null)

    // API hooks
    const { data: blogsData, loading: blogsLoading, error: blogsError } = useBlogs()
    const { mutate: createBlog } = useCreateBlog()
    const { mutate: updateBlog } = useUpdateBlog()
    const { mutate: deleteBlog } = useDeleteBlog()

    const blogs = (blogsData as any)?.blogs || []

    const handleColumnToggle = (columnKey: string) => {
        setSelectedColumns(prev =>
            prev.includes(columnKey)
                ? prev.filter(key => key !== columnKey)
                : [...prev, columnKey]
        )
    }

    const handleToggleActive = async (blogId: string) => {
        const blog = blogs.find((b: any) => b._id === blogId)
        if (blog) {
            try {
                await updateBlog({
                    variables: {
                        id: blogId,
                        input: { isActive: !blog.isActive }
                    }
                })
            } catch (error) {
                console.error('Failed to toggle blog active status:', error)
            }
        }
    }

    const handleDeleteClick = (blogId: string) => {
        setBlogToDelete(blogId)
        setDeleteAlertOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (blogToDelete) {
            try {
                await deleteBlog({
                    variables: {
                        id: blogToDelete
                    }
                })
                setBlogToDelete(null)
            } catch (error) {
                console.error('Failed to delete blog:', error)
            }
        }
        setDeleteAlertOpen(false)
    }

    const handleEdit = (blogId: string) => {
        const blog = blogs.find((b: any) => b._id === blogId)
        if (blog) {
            setEditingBlog(blog)
            setIsDialogOpen(true)
        }
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingBlog(null)
    }

    const handleAddBlog = () => {
        setEditingBlog(null)
        setIsDialogOpen(true)
    }

    const handleImagePreview = (url: string, title: string) => {
        setImagePreview({ url, title })
    }

    return {
        blogs,
        blogsLoading,
        blogsError,
        createBlog,
        updateBlog,
        selectedColumns,
        handleColumnToggle,
        isDialogOpen,
        setIsDialogOpen,
        editingBlog,
        handleEdit,
        handleCloseDialog,
        handleAddBlog,
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
