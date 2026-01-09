"use client";

import { useState, useMemo } from "react";

interface Identifiable {
    _id: string;
}

interface SeoEnabled {
    seo?: any;
}

export function useSeoManagement<T extends Identifiable & SeoEnabled>(
    items: T[],
    searchFields: (keyof T)[],
) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "configured" | "not-configured">("all");
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const stats = useMemo(() => {
        const total = items.length;
        const configured = items.filter((p) => p.seo).length;
        return { total, configured };
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch = searchFields.some((field) => {
                const val = item[field];
                return typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase());
            });

            const matchesFilter =
                filterStatus === "all" ||
                (filterStatus === "configured" && item.seo) ||
                (filterStatus === "not-configured" && !item.seo);

            return matchesSearch && matchesFilter;
        });
    }, [items, searchTerm, filterStatus, searchFields]);

    const handleEdit = (item: T) => {
        setSelectedItem(item);
        setIsFormOpen(true);
    };

    const handleDelete = (item: T) => {
        setSelectedItem(item);
        setIsDeleteDialogOpen(true);
    };

    const closeDialogs = () => {
        setIsFormOpen(false);
        setIsDeleteDialogOpen(false);
        setSelectedItem(null);
    };

    return {
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        selectedItem,
        isFormOpen,
        setIsFormOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        stats,
        filteredItems,
        handleEdit,
        handleDelete,
        closeDialogs,
    };
}
