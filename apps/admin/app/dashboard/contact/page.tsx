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
  MessageSquare, 
  Search, 
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2
} from "lucide-react"
import { 
  useContactQueries, 
  getContactStats, 
  ContactQuery, 
  ContactStatus, 
  ContactType,
  ContactPriority,
  statusLabels,
  typeLabels,
  priorityLabels
} from "@/lib/contact/useContact"
import ContactTable from "./components/ContactTable"
import ContactDetailsDialog from "./components/ContactDetailsDialog"
import ContactReplyDialog from "./components/ContactReplyDialog"

const statuses: (ContactStatus | "ALL")[] = ["ALL", "NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"]
const types: (ContactType | "ALL")[] = ["ALL", "GENERAL", "ORDER_ISSUE", "PRODUCT_INQUIRY", "COMPLAINT", "FEEDBACK", "RETURN_REQUEST"]
const priorities: (ContactPriority | "ALL")[] = ["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"]

export default function ContactPage() {
  const { queries, loading, refetch } = useContactQueries()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "ALL">("ALL")
  const [typeFilter, setTypeFilter] = useState<ContactType | "ALL">("ALL")
  const [priorityFilter, setPriorityFilter] = useState<ContactPriority | "ALL">("ALL")
  
  const [selectedQuery, setSelectedQuery] = useState<ContactQuery | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showReplyDialog, setShowReplyDialog] = useState(false)

  const stats = useMemo(() => getContactStats(queries), [queries])

  const filteredQueries = useMemo(() => {
    return queries.filter(query => {
      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase()
        if (
          !query.name.toLowerCase().includes(search) &&
          !query.email.toLowerCase().includes(search) &&
          !query.subject.toLowerCase().includes(search) &&
          !query.message.toLowerCase().includes(search) &&
          !(query.orderId?.toLowerCase().includes(search))
        ) {
          return false
        }
      }

      // Status filter
      if (statusFilter !== "ALL" && query.status !== statusFilter) {
        return false
      }

      // Type filter
      if (typeFilter !== "ALL" && query.type !== typeFilter) {
        return false
      }

      // Priority filter
      if (priorityFilter !== "ALL" && query.priority !== priorityFilter) {
        return false
      }

      return true
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [queries, searchQuery, statusFilter, typeFilter, priorityFilter])

  const handleView = (query: ContactQuery) => {
    setSelectedQuery(query)
    setShowDetailsDialog(true)
  }

  const handleReply = (query: ContactQuery) => {
    setSelectedQuery(query)
    setShowReplyDialog(true)
  }

  const handleSuccess = () => {
    refetch()
    setSelectedQuery(null)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contact Queries</h1>
        <p className="text-muted-foreground">
          Manage customer inquiries, complaints, and feedback
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All time queries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.new}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Being handled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">
              Successfully resolved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">
              Response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Query Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Query Distribution</CardTitle>
          <CardDescription>Breakdown by type and priority</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* By Type */}
            <div>
              <h4 className="text-sm font-medium mb-3">By Type</h4>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(typeLabels) as ContactType[]).map((type) => {
                  const count = stats.byType[type] || 0
                  return (
                    <div 
                      key={type}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm"
                    >
                      <span>{typeLabels[type]}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* By Priority */}
            <div>
              <h4 className="text-sm font-medium mb-3">By Priority</h4>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(priorityLabels) as ContactPriority[]).map((priority) => {
                  const count = stats.byPriority[priority] || 0
                  const colors: Record<ContactPriority, string> = {
                    LOW: "bg-gray-100",
                    MEDIUM: "bg-blue-100",
                    HIGH: "bg-orange-100",
                    URGENT: "bg-red-100"
                  }
                  return (
                    <div 
                      key={priority}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${colors[priority]}`}
                    >
                      <span>{priorityLabels[priority]}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-white text-xs font-medium">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Queries</CardTitle>
          <CardDescription>
            View and respond to customer queries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, subject, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ContactStatus | "ALL")}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "ALL" ? "All Status" : statusLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as ContactType | "ALL")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "ALL" ? "All Types" : typeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(value) => setPriorityFilter(value as ContactPriority | "ALL")}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority === "ALL" ? "All Priority" : priorityLabels[priority]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <ContactTable 
            queries={filteredQueries} 
            onRefresh={refetch}
            onView={handleView}
            onReply={handleReply}
          />
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <ContactDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        query={selectedQuery}
        onReply={handleReply}
      />

      {/* Reply Dialog */}
      <ContactReplyDialog
        open={showReplyDialog}
        onOpenChange={setShowReplyDialog}
        query={selectedQuery}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
