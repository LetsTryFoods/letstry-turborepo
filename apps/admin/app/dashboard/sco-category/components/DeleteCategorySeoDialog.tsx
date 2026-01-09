"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation } from "@apollo/client/react";
import { DELETE_CATEGORY_SEO } from "@/lib/graphql/categories-seo";

interface Category {
    _id: string;
    name: string;
    seo?: {
        _id: string;
    } | null;
}

interface DeleteCategorySeoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: Category;
    onSuccess: () => void;
}

export function DeleteCategorySeoDialog({
    open,
    onOpenChange,
    category,
    onSuccess,
}: DeleteCategorySeoDialogProps) {
    const [deleteMutation, { loading }] = useMutation(DELETE_CATEGORY_SEO);

    const handleDelete = async () => {
        if (!category._id) return;

        try {
            await deleteMutation({
                variables: { categoryId: category._id },
                refetchQueries: ['GetCategoriesWithSeo'],
            });
            onSuccess();
        } catch (error) {
            console.error("Failed to delete category SEO:", error);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete SEO Configuration</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the SEO configuration for "{category.name}"?
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
