import { useState } from 'react';
import { useBlogCategories } from '@/lib/blog-categories/useBlogCategories';

export function useBlogCategoryPage() {
    const {
        categories,
        categoriesLoading,
        categoriesError,
        createBlogCategory,
        updateBlogCategory,
        deleteBlogCategory,
    } = useBlogCategories();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

    const handleAddCategory = () => {
        setEditingCategory(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (category: any) => {
        setEditingCategory(category);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingCategory(null);
    };

    const handleDeleteClick = (id: string) => {
        setCategoryToDelete(id);
        setDeleteAlertOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (categoryToDelete) {
            try {
                await deleteBlogCategory({
                    variables: { id: categoryToDelete },
                });
                setDeleteAlertOpen(false);
                setCategoryToDelete(null);
            } catch (error) {
                console.error('Failed to delete category:', error);
            }
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await updateBlogCategory({
                variables: {
                    id,
                    input: { isActive: !currentStatus },
                },
            });
        } catch (error) {
            console.error('Failed to toggle category status:', error);
        }
    };

    return {
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
    };
}
