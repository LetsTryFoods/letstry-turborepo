"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, RefreshCw, Folder, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { useCategorySeoPage } from "@/hooks/useCategorySeoPage";
import { CategorySeoTable } from "./components/CategorySeoTable";
import { CategorySeoForm } from "./components/CategorySeoForm";
import { Pagination } from "../components/pagination";

export default function CategorySeoPage() {
    const {
        categories,
        seoStatusMap,
        stats,
        isLoading,
        updateLoading,
        error,
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
    } = useCategorySeoPage();

    const handleRefresh = () => {
        refetchCategories();
    };

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive">Error loading data: {error.message}</p>
                        <Button onClick={handleRefresh} variant="outline" className="mt-4">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Category SEO Management</h1>
                    <p className="text-muted-foreground">
                        Manage SEO metadata for each category to improve search visibility
                    </p>
                </div>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                        <Folder className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCategories}</div>
                        <p className="text-xs text-muted-foreground">Categories in catalog</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SEO Configured</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.configuredCount}</div>
                        <p className="text-xs text-muted-foreground">Categories with SEO</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Not Configured</CardTitle>
                        <XCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.notConfiguredCount}</div>
                        <p className="text-xs text-muted-foreground">Categories need SEO</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Coverage</CardTitle>
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.coveragePercentage}%</div>
                        <p className="text-xs text-muted-foreground">SEO coverage rate</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>
                        Click on a category to add or edit its SEO configuration
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or slug..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={filterStatus}
                            onValueChange={(value: "all" | "configured" | "not-configured") => setFilterStatus(value)}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="configured">SEO Configured</SelectItem>
                                <SelectItem value="not-configured">Not Configured</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <CategorySeoTable
                        categories={categories}
                        loading={isLoading}
                        onManageSeo={handleEditSeo}
                    />

                    {paginationMeta && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={paginationMeta.totalPages}
                            totalCount={paginationMeta.totalCount}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            hasNextPage={paginationMeta.hasNextPage}
                            hasPreviousPage={paginationMeta.hasPreviousPage}
                        />
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
                <DialogContent className="sm:max-w-screen-xl w-[95vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedCategory?.seo ? "Edit" : "Add"} SEO for {selectedCategory?.name}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedCategory && (
                        <CategorySeoForm
                            category={selectedCategory}
                            existingSeo={selectedCategory.seo}
                            isLoading={updateLoading}
                            onSubmit={(data) => updateCategorySeo(selectedCategory._id, data).then(handleFormSuccess)}
                            onCancel={handleCloseForm}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
