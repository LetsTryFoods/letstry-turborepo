"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react";
import { usePolicySeoPage } from "@/hooks/usePolicySeoPage";
import { PolicySeoTable } from "./components/PolicySeoTable";
import { PolicySeoForm } from "./components/PolicySeoForm";

export default function PolicySeoPage() {
  const {
    policies,
    isLoading,
    updateLoading,
    error,
    isFormOpen,
    selectedPolicy,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    handleEditSeo,
    handleCloseForm,
    handleFormSuccess,
    updatePolicySeo,
    stats,
    refetchPolicies,
  } = usePolicySeoPage();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Policy SEO Management
          </h1>
          <p className="text-muted-foreground">
            Configure search engine behavior for legal and information policies
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetchPolicies()}
          disabled={isLoading}
        >
          <RefreshCw
            className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Policies</CardDescription>
            <CardTitle className="text-2xl">{stats.totalPolicies}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>SEO Configured</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {stats.configuredCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Coverage</CardDescription>
            <CardTitle className="text-2xl">
              {stats.coveragePercentage}%
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Not Set</CardDescription>
            <CardTitle className="text-2xl text-orange-600">
              {stats.notConfiguredCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Policy List</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policies..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={filterStatus}
                onValueChange={(
                  value: "all" | "configured" | "not-configured",
                ) => setFilterStatus(value)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Policies</SelectItem>
                  <SelectItem value="configured">SEO Configured</SelectItem>
                  <SelectItem value="not-configured">Not Configured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md mb-4">
              Error loading policies. Please try again.
            </div>
          )}

          <PolicySeoTable
            policies={policies}
            loading={isLoading}
            onManageSeo={handleEditSeo}
          />
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="sm:max-w-screen-xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Manage SEO: {selectedPolicy?.title}</DialogTitle>
          </DialogHeader>
          <div className="p-6 overflow-hidden">
            {selectedPolicy && (
              <PolicySeoForm
                policy={selectedPolicy}
                onSubmit={(data) =>
                  updatePolicySeo(selectedPolicy._id, data).then(
                    handleFormSuccess,
                  )
                }
                onCancel={handleCloseForm}
                isLoading={updateLoading}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
