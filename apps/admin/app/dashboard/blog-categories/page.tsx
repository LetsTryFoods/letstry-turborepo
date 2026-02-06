'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useBlogCategoryPage } from "@/hooks/useBlogCategoryPage"
import { BlogCategoryForm } from "./components/BlogCategoryForm"
import { BlogCategoryTable } from "./components/BlogCategoryTable"
import { DeleteBlogCategoryDialog } from "./components/DeleteBlogCategoryDialog"

export default function BlogCategoriesPage() {
    const {
        categories,
        categoriesLoading,
        categoriesError,
        createBlogCategory,
        updateBlogCategory,
        isDialogOpen,
        setIsDialogOpen,
        editingCategory,
        handleEdit,
        handleCloseDialog,
        handleAddCategory,
        deleteAlertOpen,
        setDeleteAlertOpen,
        handleDeleteClick,
        handleDeleteConfirm,
        handleToggleActive,
    } = useBlogCategoryPage()

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Blog Categories</h2>
                <div className="flex items-center space-x-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleAddCategory}>Add Category</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                            </DialogHeader>
                            <BlogCategoryForm
                                onClose={handleCloseDialog}
                                initialData={editingCategory}
                                createBlogCategory={createBlogCategory}
                                updateBlogCategory={updateBlogCategory}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="space-y-4">
                {categoriesLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <p className="text-muted-foreground">Loading categories...</p>
                    </div>
                ) : categoriesError ? (
                    <div className="flex items-center justify-center h-32">
                        <p className="text-destructive">Error loading categories: {categoriesError.message}</p>
                    </div>
                ) : (
                    <BlogCategoryTable
                        categories={categories}
                        onToggleActive={handleToggleActive}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}
            </div>

            <DeleteBlogCategoryDialog
                open={deleteAlertOpen}
                onOpenChange={setDeleteAlertOpen}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    )
}
