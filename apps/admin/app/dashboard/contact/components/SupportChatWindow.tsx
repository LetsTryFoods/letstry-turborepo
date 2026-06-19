"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  FileText,
  Loader2,
  RefreshCw,
  Phone,
  Mail,
  AlertCircle,
  Image as ImageIcon,
  Mic,
  Video,
  Check,
  CheckCheck,
  ChevronDown,
  MessageSquare,
  User,
} from "lucide-react";
import { ContactQuery, typeLabels } from "@/lib/contact/useContact";
import { format, isToday, isYesterday, isSameDay } from "date-fns";

interface SupportChatWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: ContactQuery | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getDateLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

function getMsgTypeIcon(type: string) {
  switch (type) {
    case "IMAGE":    return <ImageIcon className="h-3 w-3" />;
    case "VIDEO":    return <Video className="h-3 w-3" />;
    case "AUDIO":    return <Mic className="h-3 w-3" />;
    case "DOCUMENT": return <FileText className="h-3 w-3" />;
    default:         return null;
  }
}

function getMsgTypeBadgeColor(type: string): string {
  switch (type) {
    case "IMAGE":    return "bg-blue-100 text-blue-700";
    case "VIDEO":    return "bg-purple-100 text-purple-700";
    case "AUDIO":    return "bg-orange-100 text-orange-700";
    case "DOCUMENT": return "bg-gray-100 text-gray-700";
    default:         return "";
  }
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function SupportChatWindow({
  open,
  onOpenChange,
  query,
}: SupportChatWindowProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageIdsRef = useRef<Set<string>>(new Set());

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    if (open && query?.phone) {
      // Reset state when query changes
      setMessages([]);
      setReplyText("");
      setSendError(null);
      messageIdsRef.current = new Set();

      fetchChatHistory();

      // Start polling for new incoming messages every 4 seconds
      pollingRef.current = setInterval(() => {
        pollNewMessages();
      }, 4000);
    } else {
      // Stop polling when window closes
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [open, query?._id]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(false);
    }
  }, [messages.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 200);
  };

  const fetchChatHistory = async () => {
    if (!query?.phone) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL}/whatsapp-chat/${query.phone}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        const msgs: any[] = data.messages || [];
        // Track all IDs on initial load
        messageIdsRef.current = new Set(msgs.map((m: any) => m._id));
        setMessages(msgs);
      }
    } catch (err) {
      console.error("Failed to fetch chat history", err);
    } finally {
      setLoading(false);
    }
  };

  // Lightweight poll — only appends genuinely new messages
  const pollNewMessages = async () => {
    if (!query?.phone) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL}/whatsapp-chat/${query.phone}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        const incoming: any[] = data.messages || [];
        const newMsgs = incoming.filter((m: any) => !messageIdsRef.current.has(m._id));
        if (newMsgs.length > 0) {
          newMsgs.forEach((m: any) => messageIdsRef.current.add(m._id));
          setMessages((prev) => [...prev, ...newMsgs]);
          // Auto-scroll only if user is near the bottom
          const el = scrollRef.current;
          if (el) {
            const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
            if (distFromBottom < 150) {
              setTimeout(() => scrollToBottom(true), 50);
            }
          }
        }
      }
    } catch { /* silent */ }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !query?.phone) return;

    try {
      setSending(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL}/whatsapp-chat/${query.phone}/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: replyText, contactId: query._id }),
        },
      );

      const data = await res.json();
      if (res.ok && data.success && data.message) {
        setSendError(null);
        setMessages((prev) => [...prev, data.message]);
        setReplyText("");
        setTimeout(() => scrollToBottom(true), 50);
      } else {
        const errMsg = data?.error || "Failed to send message";
        setSendError(errMsg);
      }
    } catch (err: any) {
      setSendError(err?.message || "Network error — could not send message.");
    } finally {
      setSending(false);
    }
  };

  // ─── Render Media ──────────────────────────────────────────────────────

  const renderMedia = (msg: any) => {
    if (!msg.mediaUrl) return null;

    if (msg.type === "IMAGE") {
      return (
        <img
          src={msg.mediaUrl}
          alt="WhatsApp Image"
          className="max-w-[220px] rounded-lg mt-2 cursor-pointer hover:opacity-90 transition-opacity border border-black/10"
          onClick={() => window.open(msg.mediaUrl, "_blank")}
        />
      );
    }
    if (msg.type === "VIDEO") {
      return (
        <video
          src={msg.mediaUrl}
          controls
          className="max-w-[220px] rounded-lg mt-2"
        />
      );
    }
    if (msg.type === "AUDIO") {
      return <audio src={msg.mediaUrl} controls className="mt-2 w-[220px]" />;
    }
    if (msg.type === "DOCUMENT") {
      return (
        <a
          href={msg.mediaUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 mt-2 px-3 py-2 bg-black/10 rounded-lg text-sm hover:bg-black/20 transition-colors max-w-[220px]"
        >
          <FileText className="h-4 w-4 shrink-0" />
          <span className="truncate">{msg.content || "Download Document"}</span>
        </a>
      );
    }
    return null;
  };

  // ─── Group messages by date ───────────────────────────────────────────

  const groupedMessages: { dateLabel: string; msgs: any[] }[] = [];
  messages.forEach((msg) => {
    const d = new Date(msg.timestamp);
    const label = getDateLabel(d);
    const last = groupedMessages[groupedMessages.length - 1];
    if (!last || last.dateLabel !== label) {
      groupedMessages.push({ dateLabel: label, msgs: [msg] });
    } else {
      last.msgs.push(msg);
    }
  });

  const queryType = query?.queryType || query?.type;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[420px] sm:w-[560px] flex flex-col p-0 gap-0">

        {/* ── Header ── */}
        <SheetHeader className="p-0 shrink-0">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#075e54] text-white">
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-lg font-semibold">
              {query?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>

            <div className="flex-1 min-w-0">
              <SheetTitle className="text-white text-base font-semibold truncate m-0 p-0">
                {query?.name || "Customer"}
              </SheetTitle>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-white/70 text-xs">
                  <Phone className="h-3 w-3" /> {query?.phone}
                </span>
                {query?.email && (
                  <span className="flex items-center gap-1 text-white/70 text-xs truncate">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{query.email}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  fetchChatHistory();
                }}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                title="Refresh chat"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 text-white/80 ${loading ? "animate-spin" : ""}`} />
              </button>

              {/* Live indicator */}
              <div className="flex items-center gap-1 mr-1" title="Auto-refreshing every 4s">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-white/60">Live</span>
              </div>
            </div>
          </div>

          {/* Complaint Context Banner */}
          {query && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold text-amber-800">Complaint Context</span>
                    {queryType && (
                      <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-medium">
                        {typeLabels[queryType] || queryType}
                      </span>
                    )}
                    {query.orderId && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-mono">
                        {query.orderId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-900 line-clamp-2">{query.message}</p>
                  {query.productNames && query.productNames.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {query.productNames.map((p, i) => (
                        <span key={i} className="text-[10px] bg-white border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded-full">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-[10px] text-amber-600 mt-1">
                    Submitted {format(new Date(query.createdAt), "PPp")}
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetHeader>

        {/* ── Chat Body ── */}
        <div
          className="flex-1 overflow-y-auto px-3 py-2 bg-[#e5ddd5]"
          onScroll={handleScroll}
          ref={scrollRef as any}
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c7b99a' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Loading messages...</span>
            </div>
          ) : groupedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
              <div className="h-14 w-14 rounded-full bg-white/60 flex items-center justify-center">
                <MessageSquare className="h-7 w-7 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">No messages yet</p>
                <p className="text-xs text-gray-400 mt-1">Send a message to start the conversation.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1 pb-2">
              {groupedMessages.map(({ dateLabel, msgs }) => (
                <div key={dateLabel}>
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-3">
                    <span className="bg-white/70 backdrop-blur-sm text-gray-500 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
                      {dateLabel}
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="space-y-1.5">
                    {msgs.map((msg, i) => {
                      const isIncoming = msg.direction === "INCOMING";
                      const isNonText = msg.type !== "TEXT" && msg.type !== "OTHER";
                      const showAvatar = isIncoming && (i === 0 || msgs[i - 1]?.direction !== "INCOMING");

                      return (
                        <div
                          key={msg._id || i}
                          className={`flex items-end gap-1.5 ${isIncoming ? "justify-start" : "justify-end"}`}
                        >
                          {/* Incoming Avatar */}
                          {isIncoming && (
                            <div className={`h-6 w-6 rounded-full bg-[#075e54] flex items-center justify-center shrink-0 mb-0.5 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                              <User className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}

                          <div className={`max-w-[78%] flex flex-col ${isIncoming ? "items-start" : "items-end"}`}>
                            {/* Message Bubble */}
                            <div
                              className={`relative px-3 py-2 shadow-sm rounded-2xl ${
                                isIncoming
                                  ? "bg-white text-gray-800 rounded-tl-none"
                                  : "bg-[#d9fdd3] text-gray-800 rounded-tr-none"
                              }`}
                            >
                              {/* Type Badge for non-text */}
                              {isNonText && (
                                <div className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full mb-1.5 ${getMsgTypeBadgeColor(msg.type)}`}>
                                  {getMsgTypeIcon(msg.type)}
                                  {msg.type}
                                </div>
                              )}

                              {/* Text content */}
                              {msg.content && (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                  {msg.content}
                                </p>
                              )}

                              {/* Media */}
                              {renderMedia(msg)}

                              {/* Timestamp + Delivery status */}
                              <div className={`flex items-center justify-end gap-1 mt-1 ${isIncoming ? "text-gray-400" : "text-gray-500"}`}>
                                <span className="text-[10px]">
                                  {format(new Date(msg.timestamp), "HH:mm")}
                                </span>
                                {!isIncoming && (
                                  <CheckCheck className="h-3 w-3 text-[#53bdeb]" />
                                )}
                              </div>
                            </div>

                            {/* Message ID (subtle, for debugging) */}
                            {msg.messageId && (
                              <span className="text-[9px] text-gray-400 mt-0.5 font-mono px-1 truncate max-w-full" title={msg.messageId}>
                                id: {msg.messageId.slice(-8)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-20 right-6 h-9 w-9 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <ChevronDown className="h-4 w-4 text-gray-600" />
          </button>
        )}

        {/* ── Footer ── */}
        <div className="px-3 py-2.5 bg-[#f0f2f5] border-t shrink-0">
          {sendError && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="font-medium">Send failed:</span>
              <span className="flex-1">{sendError}</span>
              <button
                className="text-red-400 hover:text-red-600 ml-auto"
                onClick={() => setSendError(null)}
              >
                ✕
              </button>
            </div>
          )}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={sending}
              className="flex-1 rounded-full bg-white border-0 shadow-sm focus-visible:ring-1 focus-visible:ring-[#075e54] text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e as any);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={sending || !replyText.trim()}
              className="rounded-full h-9 w-9 bg-[#075e54] hover:bg-[#064d44] text-white shrink-0 shadow-sm"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
