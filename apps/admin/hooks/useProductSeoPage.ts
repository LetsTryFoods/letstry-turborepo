"use client";

import { useState, useMemo } from "react";
import { useProductsForSeo, useUpdateProductSeo, Product, ProductSeo } from "@/lib/products/useProducts";

interface ProductSeoStatus {
  productId: string;
  hasSeo: boolean;
  metaTitle?: string;
  seoData?: ProductSeo;
}

export function useProductSeoPage() {
  // State for dialogs and selected items
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSeoData, setSelectedSeoData] = useState<ProductSeo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "configured" | "not-configured">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Fetch products with embedded SEO data
  const { data: productsData, loading: productsLoading, error: productsError, refetch: refetchProducts } = useProductsForSeo(
    { page: currentPage, limit: pageSize },
    true // Include out of stock products
  );
  
  // Update product SEO hook (uses updateProduct mutation)
  const { updateProductSeo, loading: updateLoading } = useUpdateProductSeo();

  // Extract products from query result with proper typing
  const productsResponse = (productsData as any)?.products;
  const products: Product[] = productsResponse?.items || [];
  const paginationMeta = productsResponse?.meta;

  // Create a map of product ID to SEO status for quick lookup (using embedded seo from product)
  const seoStatusMap = useMemo(() => {
    const map = new Map<string, ProductSeoStatus>();
    
    products.forEach((product: Product) => {
      if (product.seo && product.seo.metaTitle) {
        map.set(product._id, {
          productId: product._id,
          hasSeo: true,
          metaTitle: product.seo.metaTitle,
          seoData: product.seo,
        });
      }
    });
    
    return map;
  }, [products]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProducts = paginationMeta?.totalCount || products.length;
    const configuredCount = products.filter((p: Product) => p.seo && p.seo.metaTitle).length;
    const notConfiguredCount = totalProducts - configuredCount;

    return {
      totalProducts,
      configuredCount,
      notConfiguredCount,
      coveragePercentage: totalProducts > 0 
        ? Math.round((configuredCount / totalProducts) * 100) 
        : 0,
    };
  }, [products, paginationMeta]);

  // Filter products based on search and status
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product: Product) => {
      // Search filter
      const matchesSearch = 
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter - use embedded seo
      const hasSeo = !!(product.seo && product.seo.metaTitle);
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "configured" && hasSeo) ||
        (filterStatus === "not-configured" && !hasSeo);

      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, filterStatus]);

  // Handlers
  const handleEditSeo = (product: Product) => {
    setSelectedProduct(product);
    // Use embedded SEO from product
    setSelectedSeoData(product.seo || null);
    setIsFormOpen(true);
  };

  const handleDeleteSeo = (product: Product) => {
    setSelectedProduct(product);
    // Use embedded SEO from product
    setSelectedSeoData(product.seo || null);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
    setSelectedSeoData(null);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
    setSelectedSeoData(null);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    refetchProducts(); // Refetch products to get updated SEO
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct?._id) return;

    try {
      // To "delete" SEO, we set all SEO fields to null/empty via updateProduct
      await updateProductSeo(selectedProduct._id, {
        metaTitle: "",
        metaDescription: "",
        metaKeywords: [],
        canonicalUrl: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
      });
      handleCloseDeleteDialog();
      refetchProducts(); // Refetch products to get updated SEO
    } catch (error) {
      console.error("Failed to delete product SEO:", error);
    }
  };

  // Loading and error states
  const isLoading = productsLoading;
  const error = productsError;

  return {
    // Data
    products: filteredProducts,
    seoStatusMap,
    stats,
    
    // Loading states
    isLoading,
    deleteLoading: updateLoading,
    error,
    
    // Form dialog state
    isFormOpen,
    selectedProduct,
    selectedSeoData,
    
    // Delete dialog state
    isDeleteDialogOpen,
    
    // Filters
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    
    // Handlers
    handleEditSeo,
    handleDeleteSeo,
    handleCloseForm,
    handleCloseDeleteDialog,
    handleFormSuccess,
    handleConfirmDelete,
    
    // Refetch
    refetchProducts,

    // Pagination
    currentPage,
    setCurrentPage,
    pageSize,
    paginationMeta,
  };
}
