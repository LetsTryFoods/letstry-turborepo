"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Bell, 
  Mail, 
  MessageSquare, 
  Send, 
  Clock, 
  Search,
  BarChart3,
  MousePointer,
  Plus,
  CheckCircle,
  XCircle
} from "lucide-react"
import { 
  useNotifications, 
  NotificationStatus, 
  NotificationType,
  getNotificationStats 
} from "@/lib/notifications/useNotifications"
import NotificationTable from "./components/NotificationTable"
import SendNotificationDialog from "./components/SendNotificationDialog"

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | "ALL">("ALL")
  const [typeFilter, setTypeFilter] = useState<NotificationType | "ALL">("ALL")
  const [showSendDialog, setShowSendDialog] = useState(false)

  const { data, refetch } = useNotifications()
  const notifications = data?.notifications || []

  // Get overall stats
  const stats = useMemo(() => getNotificationStats(notifications), [notifications])

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch = 
        searchQuery === "" ||
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = 
        statusFilter === "ALL" || 
        notification.status === statusFilter

      const matchesType = 
        typeFilter === "ALL" || 
        notification.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [notifications, searchQuery, statusFilter, typeFilter])

  return (
    <div className="space-y-6 mx-6 auto mb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Send and manage notifications to your customers
          </p>
        </div>
        <Button onClick={() => setShowSendDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Send Notification
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.sent} campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgOpenRate}%</div>
            <p className="text-xs text-muted-foreground">
              Email & Push notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgClickRate}%</div>
            <p className="text-xs text-muted-foreground">
              Engagement metric
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">
              Pending to be sent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Type & Status Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Notification Types */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">By Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Bell className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{stats.pushCount}</p>
                <p className="text-xs text-muted-foreground">Push</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{stats.emailCount}</p>
                <p className="text-xs text-muted-foreground">Email</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{stats.smsCount}</p>
                <p className="text-xs text-muted-foreground">SMS</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold">{stats.draft}</p>
                <p className="text-xs text-muted-foreground">Draft</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-xl font-bold text-orange-600">{stats.scheduled}</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xl font-bold text-green-600">{stats.sent}</p>
                <p className="text-xs text-muted-foreground">Sent</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-xl font-bold text-red-600">{stats.failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value as NotificationStatus | "ALL")}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={typeFilter} 
              onValueChange={(value) => setTypeFilter(value as NotificationType | "ALL")}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="PUSH">Push</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("ALL")
                setTypeFilter("ALL")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredNotifications.length} of {notifications.length} notifications
        </p>
      </div>

      {/* Notification Table */}
      <NotificationTable 
        notifications={filteredNotifications} 
        onRefresh={refetch}
      />

      {/* Send Notification Dialog */}
      <SendNotificationDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        onSuccess={refetch}
      />
    </div>
  )
}
