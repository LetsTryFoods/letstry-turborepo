"use client";

import { useState, useCallback } from "react";
import {
  useSeoContents,
  useCreateSeoContent,
  useUpdateSeoContent,
  useDeleteSeoContent,
  SeoContent,
  CreateSeoContentInput,
  UpdateSeoContentInput,
} from "@/lib/seo/useSeo";

const ALL_COLUMNS = [
  { key: "pageName", label: "Page Name" },
  { key: "pageSlug", label: "Slug" },
  { key: "metaTitle", label: "Meta Title" },
  { key: "metaDescription", label: "Meta Description" },
  { key: "ogTitle", label: "Social Title" },
  { key: "ogImage", label: "Social Image" },
  { key: "isActive", label: "Active" },
  { key: "updatedAt", label: "Updated At" },
];

const DEFAULT_COLUMNS = [
  "pageName",
  "pageSlug",
  "metaTitle",
  "isActive",
  "updatedAt",
];

export function useSeoPage() {
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSeo, setEditingSeo] = useState<SeoContent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seoToDelete, setSeoToDelete] = useState<SeoContent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // API Hooks
  const { data, loading, error, refetch } = useSeoContents({
    page: currentPage,
    limit: pageSize,
  }) as { data: { seoContents?: { items?: SeoContent[]; meta?: any } } | undefined; loading: boolean; error: any; refetch: () => void };
  const [createSeoContent, { loading: creating }] = useCreateSeoContent();
  const [updateSeoContent, { loading: updating }] = useUpdateSeoContent();
  const [deleteSeoContent, { loading: deleting }] = useDeleteSeoContent();

  // Data
  const seoContents: SeoContent[] = data?.seoContents?.items || [];
  const meta = data?.seoContents?.meta;

  // Filter by search term and status
  const filteredSeoContents = seoContents.filter((seo) => {
    const matchesSearch =
      seo.pageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seo.pageSlug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seo.metaTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && seo.isActive) ||
      (filterStatus === "inactive" && !seo.isActive);

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleColumnToggle = useCallback((columnKey: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleCreate = useCallback(async (input: CreateSeoContentInput) => {
    try {
      await createSeoContent({ variables: { input } });
      setIsFormOpen(false);
      refetch();
    } catch (error) {
      console.error("Error creating SEO content:", error);
      throw error;
    }
  }, [createSeoContent, refetch]);

  const handleUpdate = useCallback(async (id: string, input: UpdateSeoContentInput) => {
    try {
      await updateSeoContent({ variables: { id, input } });
      setIsFormOpen(false);
      setEditingSeo(null);
      refetch();
    } catch (error) {
      console.error("Error updating SEO content:", error);
      throw error;
    }
  }, [updateSeoContent, refetch]);

  const handleDelete = useCallback(async () => {
    if (!seoToDelete) return;
    try {
      await deleteSeoContent({ variables: { id: seoToDelete._id } });
      setDeleteDialogOpen(false);
      setSeoToDelete(null);
      refetch();
    } catch (error) {
      console.error("Error deleting SEO content:", error);
      throw error;
    }
  }, [deleteSeoContent, seoToDelete, refetch]);

  const handleEdit = useCallback((seo: SeoContent) => {
    setEditingSeo(seo);
    setIsFormOpen(true);
  }, []);

  const handleOpenDeleteDialog = useCallback((seo: SeoContent) => {
    setSeoToDelete(seo);
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingSeo(null);
  }, []);

  const handleActiveToggle = useCallback(async (seo: SeoContent) => {
    try {
      await updateSeoContent({
        variables: {
          id: seo._id,
          input: { isActive: !seo.isActive },
        },
      });
      refetch();
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  }, [updateSeoContent, refetch]);

  return {
    // State
    state: {
      seoContents: filteredSeoContents,
      meta,
      loading,
      error,
      creating,
      updating,
      deleting,
      selectedColumns,
      isFormOpen,
      editingSeo,
      deleteDialogOpen,
      seoToDelete,
      searchTerm,
      filterStatus,
      currentPage,
      pageSize,
    },
    // Actions
    actions: {
      handleColumnToggle,
      handlePageChange,
      handleCreate,
      handleUpdate,
      handleDelete,
      handleEdit,
      handleOpenDeleteDialog,
      handleCloseForm,
      handleActiveToggle,
      setIsFormOpen,
      setDeleteDialogOpen,
      setSearchTerm,
      setFilterStatus,
    },
    // Constants
    allColumns: ALL_COLUMNS,
  };
}
