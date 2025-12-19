"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  HelpCircle, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle,
  Loader2
} from "lucide-react"
import { useFAQs, getFAQStats, FAQ, FAQCategory, FAQStatus, categoryLabels } from "@/lib/faq/useFAQ"
import FAQTable from "./components/FAQTable"
import FAQFormDialog from "./components/FAQFormDialog"

const categories: (FAQCategory | "ALL")[] = ["ALL", "GENERAL", "ORDERS", "SHIPPING", "RETURNS", "PRODUCTS", "PAYMENT"]
const statuses: (FAQStatus | "ALL")[] = ["ALL", "ACTIVE", "INACTIVE"]

export default function FAQPage() {
  const { data, loading, refetch } = useFAQs()
  const faqs = data.faqs
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<FAQCategory | "ALL">("ALL")
  const [statusFilter, setStatusFilter] = useState<FAQStatus | "ALL">("ALL")
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null)

  const stats = useMemo(() => getFAQStats(faqs), [faqs])

  const filteredFAQs = useMemo(() => {
    return faqs.filter(faq => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !faq.question.toLowerCase().includes(query) &&
          !faq.answer.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      // Category filter
      if (categoryFilter !== "ALL" && faq.category !== categoryFilter) {
        return false
      }

      // Status filter
      if (statusFilter !== "ALL" && faq.status !== statusFilter) {
        return false
      }

      return true
    }).sort((a, b) => a.order - b.order)
  }, [faqs, searchQuery, categoryFilter, statusFilter])

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq)
    setShowFormDialog(true)
  }

  const handleAddNew = () => {
    setEditingFAQ(null)
    setShowFormDialog(true)
  }

  const handleSuccess = () => {
    refetch()
    setEditingFAQ(null)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQ Management</h1>
          <p className="text-muted-foreground">
            Manage frequently asked questions for your customers
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Questions in database
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active FAQs</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Visible to customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive FAQs</CardTitle>
            <XCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Hidden from website
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.categoryCount).filter(k => stats.categoryCount[k as FAQCategory] > 0).length}</div>
            <p className="text-xs text-muted-foreground">
              FAQ categories used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
          <CardDescription>FAQs organized by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(categoryLabels) as FAQCategory[]).map((category) => {
              const count = stats.categoryCount[category] || 0
              return (
                <div 
                  key={category}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted"
                >
                  <span className="font-medium">{categoryLabels[category]}</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-sm">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>FAQ List</CardTitle>
          <CardDescription>
            View and manage all frequently asked questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search questions or answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value as FAQCategory | "ALL")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "ALL" ? "All Categories" : categoryLabels[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as FAQStatus | "ALL")}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "ALL" ? "All Status" : status.charAt(0) + status.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <FAQTable 
            faqs={filteredFAQs} 
            onRefresh={refetch} 
            onEdit={handleEdit}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <FAQFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        faq={editingFAQ}
        onSuccess={handleSuccess}
        totalFAQs={faqs.length}
      />
    </div>
  )
}
