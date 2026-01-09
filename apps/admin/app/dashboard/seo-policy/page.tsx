"use client";

import { useQuery } from "@apollo/client/react";
import { FileText } from "lucide-react";
import { PolicySeoTable } from "./components/PolicySeoTable";
import { GET_POLICIES_WITH_SEO } from "@/lib/graphql/policies-seo";
import { SeoPageLayout } from "@/components/seo/SeoPageLayout";
import { useSeoManagement } from "@/lib/seo/hooks/useSeoManagement";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export default function PolicySeoPage() {
    const { data, loading, refetch } = useQuery<{
        policies: any[];
    }>(GET_POLICIES_WITH_SEO, {
        notifyOnNetworkStatusChange: true,
    });

    const policies = data?.policies || [];

    const {
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        stats,
        filteredItems,
    } = useSeoManagement(policies, ["title", "type"]);

    return (
        <SeoPageLayout
            title="Policy SEO Management"
            description="Manage SEO metadata for legal and informational policy pages"
            icon={<FileText className="h-6 w-6" />}
            total={stats.total}
            configured={stats.configured}
            loading={loading}
            onRefresh={() => refetch()}
            statsLabels={{
                total: "Total Policies",
                configured: "SEO Configured",
                notConfigured: "Not Configured",
            }}
        >
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search policies by title or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select
                    value={filterStatus}
                    onValueChange={(value: any) => setFilterStatus(value)}
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

            <PolicySeoTable
                policies={filteredItems}
                onRefresh={() => refetch()}
            />
        </SeoPageLayout>
    );
}
