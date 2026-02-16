"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  Search,
  IndianRupee,
  UserPlus,
  Filter,
  Smartphone,
  Monitor,
  Laptop,
  Globe,
} from "lucide-react";
import { useCustomers } from "@/lib/customers/useCustomers";
import CustomerTable from "./components/CustomerTable";
import CustomerFilters from "./components/CustomerFilters";
import StatCard from "./components/StatCard";
import { formatCurrency } from "./utils/customerUtils";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

interface FilterValues {
  sortBy: string;
  sortOrder: string;
  startDate: string;
  endDate: string;
  minSpent: string;
  maxSpent: string;
  cartStatus: string;
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    sortBy: "",
    sortOrder: "",
    startDate: "",
    endDate: "",
    minSpent: "",
    maxSpent: "",
    cartStatus: "",
  });

  const { data, refetch } = useCustomers({
    searchTerm: searchQuery,
    sortBy: (filters.sortBy || undefined) as any,
    sortOrder: (filters.sortOrder || undefined) as any,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    minSpent: filters.minSpent ? parseFloat(filters.minSpent) : undefined,
    maxSpent: filters.maxSpent ? parseFloat(filters.maxSpent) : undefined,
    cartStatus: (filters.cartStatus || undefined) as any,
  });

  const customers = data?.customers || [];
  const summary = data?.summary;
  const meta = data?.meta;

  const handleFilterChange = (values: FilterValues) => {
    setFilters(values);
  };

  const handleClearFilters = () => {
    setFilters({
      sortBy: "",
      sortOrder: "",
      startDate: "",
      endDate: "",
      minSpent: "",
      maxSpent: "",
      cartStatus: "",
    });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="space-y-6 mx-6 auto mb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage your customer accounts and view their details
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Registered Users"
          value={summary?.totalRegistered || 0}
          description={
            <>
              <span className="text-green-600">
                +{summary?.newThisMonth || 0}
              </span>{" "}
              this month
            </>
          }
          icon={Users}
        />

        <StatCard
          title="Total Guest Users"
          value={summary?.totalGuests || 0}
          description={`${summary?.statusStats.guest || 0} active guests`}
          icon={UserCheck}
          iconClassName="h-4 w-4 text-green-600"
        />

        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary?.totalRevenue || 0)}
          description={`From all customer orders`}
          icon={IndianRupee}
        />

        <StatCard
          title="New This Month"
          value={summary?.newThisMonth || 0}
          description="Customer signups"
          icon={UserPlus}
          iconClassName="h-4 w-4 text-blue-500"
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Platform Breakdown</h3>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-lg font-bold">{summary?.platformStats?.android || 0}</p>
                <p className="text-xs text-muted-foreground">Android</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-lg font-bold">{summary?.platformStats?.ios || 0}</p>
                <p className="text-xs text-muted-foreground">iOS</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-lg font-bold">{summary?.platformStats?.web || 0}</p>
                <p className="text-xs text-muted-foreground">Web</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Laptop className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-lg font-bold">{summary?.platformStats?.macos || 0}</p>
                <p className="text-xs text-muted-foreground">macOS</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-lg font-bold">{summary?.platformStats?.windows || 0}</p>
                <p className="text-xs text-muted-foreground">Windows</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-lg font-bold">{summary?.platformStats?.linux || 0}</p>
                <p className="text-xs text-muted-foreground">Linux</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-lg font-bold">{summary?.platformStats?.desktop || 0}</p>
                <p className="text-xs text-muted-foreground">Desktop</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleClearSearch}>
              Clear Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>

          <Collapsible open={showFilters}>
            <CollapsibleContent>
              <CustomerFilters
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {customers.length} of {meta?.totalCount || 0} customers
        </p>
      </div>

      <CustomerTable customers={customers} onRefresh={refetch} />
    </div>
  );
}
