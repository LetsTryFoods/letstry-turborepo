"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Trash2,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  ContactQuery,
  ContactStatus,
  ContactPriority,
  statusLabels,
  priorityLabels,
  typeLabels,
  useUpdateContactStatus,
  useDeleteContact,
  useMarkContactRead,
} from "@/lib/contact/useContact";
import { formatDistanceToNow } from "date-fns";

interface ContactTableProps {
  queries: ContactQuery[];
  onRefresh: () => void;
  onView: (query: ContactQuery) => void;
  onReply: (query: ContactQuery) => void;
  onChat?: (query: ContactQuery) => void;
  selectedQueryId?: string;
}

const statusConfig: Record<
  ContactStatus | string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ReactNode;
  }
> = {
  PENDING: {
    label: "Pending",
    variant: "destructive",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  REVIEWED: {
    label: "Reviewed",
    variant: "default",
    icon: <Clock className="h-3 w-3" />,
  },
  RESOLVED: {
    label: "Resolved",
    variant: "secondary",
    icon: <CheckCircle className="h-3 w-3" />,
  },
};

const priorityConfig: Record<
  ContactPriority,
  { label: string; className: string }
> = {
  LOW: { label: "Low", className: "bg-gray-100 text-gray-800" },
  MEDIUM: { label: "Medium", className: "bg-blue-100 text-blue-800" },
  HIGH: { label: "High", className: "bg-orange-100 text-orange-800" },
  URGENT: { label: "Urgent", className: "bg-red-100 text-red-800" },
};

export default function ContactTable({
  queries,
  onRefresh,
  onView,
  onReply,
  onChat,
  selectedQueryId,
}: ContactTableProps) {
  const STORAGE_KEY = "support_unread_ids";

  const [selectedQuery, setSelectedQuery] = useState<ContactQuery | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  /**
   * liveUnreadIds: contacts where the GlobalSupportSocket received a new
   * incoming message THIS session (before page refresh).
   * This overlays the server-side hasUnread so the badge appears instantly
   * without waiting for a full query refetch.
   */
  const [liveUnreadIds, setLiveUnreadIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set<string>(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Re-sync liveUnreadIds from localStorage when tab becomes visible
  useEffect(() => {
    const sync = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        setLiveUnreadIds(new Set<string>(stored ? JSON.parse(stored) : []));
      } catch { /* ignore */ }
    };
    sync();
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  /** Remove contact from live unread set + localStorage */
  const removeLiveUnread = (id: string) => {
    setLiveUnreadIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  /**
   * True if this contact has unread messages.
   * Server source: query.hasUnread (DB: lastInboundAt > adminLastReadAt) — survives overnight.
   * Live source: liveUnreadIds (socket messages received this session) — instant badge.
   */
  const isUnread = (query: ContactQuery): boolean =>
    !!query.hasUnread || liveUnreadIds.has(query._id);

  const { markContactRead } = useMarkContactRead();

  const handleChatOpen = (query: ContactQuery) => {
    // Optimistically clear live badge
    removeLiveUnread(query._id);
    // Persist to DB so it's cleared tomorrow too
    markContactRead(query._id);
    if (onChat) onChat(query);
  };


  const { updateStatus } = useUpdateContactStatus();
  const { deleteContact } = useDeleteContact();

  const handleStatusChange = async (
    query: ContactQuery,
    status: ContactStatus,
  ) => {
    await updateStatus(query._id, status);
    onRefresh();
  };

  const handleDelete = (query: ContactQuery) => {
    setSelectedQuery(query);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedQuery) {
      await deleteContact(selectedQuery._id);
      onRefresh();
    }
    setShowDeleteDialog(false);
    setSelectedQuery(null);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="text-center" title="WhatsApp session status">💬 WA</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Priority</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  No contact queries found
                </TableCell>
              </TableRow>
            ) : (
              queries.map((query) => {
                const status =
                  statusConfig[query.status] || statusConfig["PENDING"];
                const priority = query.priority
                  ? priorityConfig[query.priority]
                  : priorityConfig["LOW"];
                const unread = isUnread(query);
                return (
                  <TableRow
                    key={query._id}
                    className={[
                      query._id === selectedQueryId
                        ? "bg-muted/50 border-l-4 border-l-primary"
                        : unread
                          ? "bg-amber-50 border-l-4 border-l-amber-400 hover:bg-amber-100/60"
                          : "",
                    ].join(" ")}
                  >
                    <TableCell>
                      <div>
                        <p className={`font-medium ${unread ? "font-semibold text-amber-900" : ""}`}>
                          {query.name}
                          {unread && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                              New
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {query.email}
                        </p>
                        {query.phone && (
                          <Button
                            variant="link"
                            className="p-0 h-auto text-xs flex items-center text-green-600 hover:text-green-700"
                            onClick={() => handleChatOpen(query)}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {query.phone}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                      {/* WhatsApp session status dot */}
                      {(() => {
                        const hasWa = !!query.whatsappPhoneNumber;
                        const windowOpen =
                          hasWa &&
                          !!query.whatsappWindowExpiresAt &&
                          new Date(query.whatsappWindowExpiresAt) > new Date();
                        return (
                          <TableCell className="text-center">
                            <button
                              title={
                                !hasWa
                                  ? "No WhatsApp session"
                                  : windowOpen
                                    ? "Session active — click to chat"
                                    : "Session expired — click to chat"
                              }
                              onClick={() => handleChatOpen(query)}
                              className="inline-flex items-center justify-center relative"
                            >
                              <span
                                className={`h-3 w-3 rounded-full inline-block ${
                                  !hasWa
                                    ? "bg-gray-300"
                                    : windowOpen
                                      ? "bg-green-500 animate-pulse"
                                      : "bg-amber-400"
                                }`}
                              />
                              {unread && (
                                <span
                                  className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-white animate-bounce"
                                  title="New message received!"
                                />
                              )}
                            </button>
                          </TableCell>
                        );
                      })()}
                    <TableCell>
                      <div className="max-w-[250px]">
                        <p className="font-medium truncate">
                          {query.subject ||
                            (query.queryType
                              ? typeLabels[query.queryType] || query.queryType
                              : "No Subject")}
                        </p>
                        {query.orderId && (
                          <p className="text-xs text-muted-foreground">
                            Order: {query.orderId}
                          </p>
                        )}
                        {query.productNames && query.productNames.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate">
                            Products: {query.productNames.join(", ")}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(query.queryType || query.type) && (
                        <Badge variant="outline">
                          {typeLabels[query.queryType || query.type || ""] ||
                            query.queryType ||
                            query.type}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${priority.className}`}
                      >
                        {priority.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={status.variant} className="gap-1">
                        {status.icon}
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDistanceToNow(new Date(query.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                      {query.replies && query.replies.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {query.replies.length}{" "}
                          {query.replies.length === 1 ? "reply" : "replies"}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onView(query)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onReply(query)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Reply via Email
                          </DropdownMenuItem>
                          {query.phone && onChat && (
                            <DropdownMenuItem onClick={() => onChat(query)}>
                              <MessageSquare className="mr-2 h-4 w-4 text-green-600" />
                              WhatsApp Chat
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <Clock className="mr-2 h-4 w-4" />
                              Change Status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {(
                                Object.keys(statusLabels) as ContactStatus[]
                              ).map((status) => (
                                <DropdownMenuItem
                                  key={status}
                                  onClick={() =>
                                    handleStatusChange(query, status)
                                  }
                                  disabled={query.status === status}
                                >
                                  {statusLabels[status]}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(query)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact Query</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this query from{" "}
              {selectedQuery?.name}?
              <span className="block mt-2 font-medium">
                &quot;{selectedQuery?.subject}&quot;
              </span>
              <span className="block mt-2 text-red-600">
                This action cannot be undone. All replies will also be deleted.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
