'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ColumnSelector, ColumnDefinition } from "@/app/dashboard/components/column-selector"
import { ImagePreviewDialog } from "@/app/dashboard/components/image-preview-dialog"
import { useBlogPage } from "@/hooks/useBlogPage"
import { BlogForm } from "./components/BlogForm"
import { BlogTable } from "./components/BlogTable"
import { DeleteBlogDialog } from "./components/DeleteBlogDialog"

const allColumns: ColumnDefinition[] = [
    { key: "_id", label: "ID" },
    { key: "slug", label: "Slug" },
    { key: "title", label: "Title" },
    { key: "excerpt", label: "Excerpt" },
    { key: "content", label: "Content" },
    { key: "image", label: "Image" },
    { key: "date", label: "Date" },
    { key: "author", label: "Author" },
    { key: "category", label: "Category" },
    { key: "isActive", label: "Active" },
    { key: "position", label: "Position" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
]

export default function BlogsPage() {
    const {
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
    } = useBlogPage()

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Blogs</h2>
                <div className="flex items-center space-x-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleAddBlog}>Add Blog</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-7xl min-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingBlog ? 'Edit Blog' : 'Add New Blog'}</DialogTitle>
                            </DialogHeader>
                            <BlogForm
                                onClose={handleCloseDialog}
                                initialData={editingBlog}
                                createBlog={createBlog}
                                updateBlog={updateBlog}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="space-y-4">
                <ColumnSelector
                    allColumns={allColumns}
                    selectedColumns={selectedColumns}
                    onColumnToggle={handleColumnToggle}
                />

                {blogsLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <p className="text-muted-foreground">Loading blogs...</p>
                    </div>
                ) : blogsError ? (
                    <div className="flex items-center justify-center h-32">
                        <p className="text-destructive">Error loading blogs: {blogsError.message}</p>
                    </div>
                ) : (
                    <BlogTable
                        blogs={blogs}
                        selectedColumns={selectedColumns}
                        onToggleActive={handleToggleActive}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onImagePreview={handleImagePreview}
                    />
                )}
            </div>

            <DeleteBlogDialog
                open={deleteAlertOpen}
                onOpenChange={setDeleteAlertOpen}
                onConfirm={handleDeleteConfirm}
            />

            <ImagePreviewDialog
                imageUrl={imagePreview?.url || null}
                title={imagePreview?.title || ''}
                open={!!imagePreview}
                onOpenChange={() => setImagePreview(null)}
            />
        </div>
    )
}
