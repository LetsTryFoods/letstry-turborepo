"use client";

import { useState, useMemo } from "react";
import { useCategories, useUpdateCategory, Category } from "@/lib/categories/useCategories";

interface CategorySeoStatus {
    categoryId: string;
    hasSeo: boolean;
    metaTitle?: string;
    seoData?: any;
}

export function useCategorySeoPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "configured" | "not-configured">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);

    const { data: categoriesData, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories(
        { page: currentPage, limit: pageSize },
        true
    );

    const { mutate: updateCategoryMutation, loading: updateLoading } = useUpdateCategory();

    const categoriesResponse = (categoriesData as any)?.categories;
    const categories: Category[] = categoriesResponse?.items || [];
    const paginationMeta = categoriesResponse?.meta;

    const seoStatusMap = useMemo(() => {
        const map = new Map<string, CategorySeoStatus>();

        categories.forEach((category: Category) => {
            if (category.seo && category.seo.metaTitle) {
                map.set(category._id, {
                    categoryId: category._id,
                    hasSeo: true,
                    metaTitle: category.seo.metaTitle,
                    seoData: category.seo,
                });
            }
        });

        return map;
    }, [categories]);

    const stats = useMemo(() => {
        const totalCategories = paginationMeta?.totalCount || categories.length;
        const configuredCount = categories.filter((c: Category) => c.seo && c.seo.metaTitle).length;
        const notConfiguredCount = totalCategories - configuredCount;

        return {
            totalCategories,
            configuredCount,
            notConfiguredCount,
            coveragePercentage: totalCategories > 0
                ? Math.round((configuredCount / totalCategories) * 100)
                : 0,
        };
    }, [categories, paginationMeta]);

    const filteredCategories = useMemo(() => {
        if (!categories) return [];

        return categories.filter((category: Category) => {
            const matchesSearch =
                searchTerm === "" ||
                category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.slug.toLowerCase().includes(searchTerm.toLowerCase());

            const hasSeo = !!(category.seo && category.seo.metaTitle);
            const matchesStatus =
                filterStatus === "all" ||
                (filterStatus === "configured" && hasSeo) ||
                (filterStatus === "not-configured" && !hasSeo);

            return matchesSearch && matchesStatus;
        });
    }, [categories, searchTerm, filterStatus]);

    const handleEditSeo = (category: Category) => {
        setSelectedCategory(category);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedCategory(null);
    };

    const handleFormSuccess = () => {
        handleCloseForm();
        refetchCategories();
    };

    const updateCategorySeo = async (categoryId: string, seoInput: any) => {
        return updateCategoryMutation({
            variables: {
                _id: categoryId,
                input: { seo: seoInput },
            },
        });
    };

    return {
        categories: filteredCategories,
        seoStatusMap,
        stats,
        isLoading: categoriesLoading,
        updateLoading,
        error: categoriesError,
        isFormOpen,
        selectedCategory,
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        handleEditSeo,
        handleCloseForm,
        handleFormSuccess,
        updateCategorySeo,
        refetchCategories,
        currentPage,
        setCurrentPage,
        pageSize,
        paginationMeta,
    };
}
