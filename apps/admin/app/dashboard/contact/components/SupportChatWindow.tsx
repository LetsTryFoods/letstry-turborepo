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
  CheckCheck,
  ChevronDown,
  MessageSquare,
  User,
  Clock,
  ZapOff,
  Zap,
  LayoutTemplate,
} from "lucide-react";
import { ContactQuery, typeLabels } from "@/lib/contact/useContact";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import { useContactSocket } from "@/lib/contact/useContactSocket";
import {
  getConversation,
  sendFreeText,
  sendTemplate,
  sendAck,
} from "@/lib/contact/contact-whatsapp-api";

// ─── Props ──────────────────────────────────────────────────────────────────

interface SupportChatWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: ContactQuery | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDateLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

function getMsgTypeIcon(type: string) {
  switch (type) {
    case "IMAGE": return <ImageIcon className="h-3 w-3" />;
    case "VIDEO": return <Video className="h-3 w-3" />;
    case "AUDIO": return <Mic className="h-3 w-3" />;
    case "DOCUMENT": return <FileText className="h-3 w-3" />;
    default: return null;
  }
}

function getMsgTypeBadgeColor(type: string): string {
  switch (type) {
    case "IMAGE": return "bg-blue-100 text-blue-700";
    case "VIDEO": return "bg-purple-100 text-purple-700";
    case "AUDIO": return "bg-orange-100 text-orange-700";
    case "DOCUMENT": return "bg-gray-100 text-gray-700";
    default: return "";
  }
}

// ─── Window Status Badge ──────────────────────────────────────────────────────

function WindowStatusBadge({
  windowExpiresAt,
  windowOpen,
}: {
  windowExpiresAt: string | Date | null | undefined;
  windowOpen: boolean;
}) {
  if (!windowExpiresAt) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-500 font-medium">
        <ZapOff className="h-3 w-3" />
        No session
      </div>
    );
  }

  if (windowOpen) {
    const expiresAt = new Date(windowExpiresAt);
    const timeLeft = formatDistanceToNow(expiresAt, { addSuffix: false });
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 rounded-full text-xs text-green-700 font-medium">
        <Zap className="h-3 w-3 fill-green-500" />
        Session open · {timeLeft} left
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 rounded-full text-xs text-amber-700 font-medium">
      <Clock className="h-3 w-3" />
      Session expired · Template only
    </div>
  );
}

// ─── Template Picker Modal ───────────────────────────────────────────────────

function TemplatePicker({
  open,
  onClose,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  onSend: (templateName: string) => void;
}) {
  const templates = [
    { name: "customersupporttemplate", label: "Support Ack (re-open session)" },
    { name: "customerwhentheyinitiatethechat", label: "Customer Initiated Reply" },
  ];

  if (!open) return null;

  return (
    <div className="absolute inset-0 bg-black/40 z-10 flex items-end justify-center sm:items-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-5 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-1">Send Template</h3>
        <p className="text-xs text-gray-500 mb-4">
          The 24-hour session has expired. Only approved templates can be sent.
        </p>
        <div className="space-y-2">
          {templates.map((t) => (
            <button
              key={t.name}
              onClick={() => { onSend(t.name); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-green-50 hover:border-green-200 border border-gray-200 rounded-xl text-sm transition-colors text-left"
            >
              <LayoutTemplate className="h-4 w-4 text-green-600 shrink-0" />
              <div>
                <div className="font-medium text-gray-800">{t.label}</div>
                <div className="text-xs text-gray-400 font-mono">{t.name}</div>
              </div>
            </button>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-3" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

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
  const [windowOpen, setWindowOpen] = useState(false);
  const [windowExpiresAt, setWindowExpiresAt] = useState<string | null>(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageIdsRef = useRef<Set<string>>(new Set());

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  // ─── Socket.IO real-time updates ─────────────────────────────────────────

  useContactSocket({
    contactQueryId: query?._id ?? null,
    enabled: open,
    onNewMessage: useCallback((msg: any) => {
      if (!messageIdsRef.current.has(msg._id)) {
        messageIdsRef.current.add(msg._id);
        setMessages((prev) => [...prev, msg]);
        const el = scrollRef.current;
        if (el) {
          const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
          if (distFromBottom < 200) setTimeout(() => scrollToBottom(true), 50);
        }
      }
    }, [scrollToBottom]),
    onWindowUpdated: useCallback((expiresAt: string) => {
      setWindowExpiresAt(expiresAt);
      setWindowOpen(new Date(expiresAt) > new Date());
    }, []),
  });

  // ─── Load conversation on open ────────────────────────────────────────────

  useEffect(() => {
    if (open && query?._id) {
      setMessages([]);
      setReplyText("");
      setSendError(null);
      messageIdsRef.current = new Set();
      fetchConversation();
    }
  }, [open, query?._id]); // eslint-disable-line

  useEffect(() => {
    if (messages.length > 0) scrollToBottom(false);
  }, [messages.length, scrollToBottom]);

  const fetchConversation = async () => {
    if (!query?._id) return;
    try {
      setLoading(true);
      const data = await getConversation(query._id);
      const msgs: any[] = data.messages || [];
      messageIdsRef.current = new Set(msgs.map((m: any) => m._id));
      setMessages(msgs);
      setWindowOpen(data.windowOpen);
      setWindowExpiresAt(data.windowExpiresAt);
    } catch (err) {
      console.error("Failed to fetch conversation", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
  };

  // ─── Send free text ───────────────────────────────────────────────────────

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !query?._id) return;

    if (!windowOpen) {
      // Window expired — show template picker instead
      setShowTemplatePicker(true);
      return;
    }

    try {
      setSending(true);
      const data = await sendFreeText(query._id, replyText);
      if (data.success && data.message) {
        if (!messageIdsRef.current.has(data.message._id)) {
          messageIdsRef.current.add(data.message._id);
          setMessages((prev) => [...prev, data.message]);
          setTimeout(() => scrollToBottom(true), 50);
        }
        setReplyText("");
        setSendError(null);
      }
    } catch (err: any) {
      setSendError(err?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // ─── Send template ────────────────────────────────────────────────────────

  const handleSendTemplate = async (templateName: string) => {
    if (!query?._id) return;
    try {
      setSending(true);
      await sendTemplate(query._id, templateName);
      // Optimistically add a placeholder outgoing message
      const placeholder = {
        _id: `tmp_${Date.now()}`,
        direction: "OUTGOING",
        type: "TEXT",
        content: `[Template: ${templateName}]`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, placeholder]);
      setTimeout(() => scrollToBottom(true), 50);
      setSendError(null);
    } catch (err: any) {
      setSendError(err?.message || "Failed to send template");
    } finally {
      setSending(false);
    }
  };

  // ─── Render media ─────────────────────────────────────────────────────────

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
      return <video src={msg.mediaUrl} controls className="max-w-[220px] rounded-lg mt-2" />;
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

  // ─── Group messages by date ───────────────────────────────────────────────

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

  // ─── Formatting ────────────────────────────────────────────────────────────

  const formatWhatsAppText = (text: string) => {
    if (!text) return { __html: "" };

    // Escape HTML first to prevent XSS
    let safeText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Replace WhatsApp formatting
    safeText = safeText
      .replace(/\*([^\*]+)\*/g, "<strong>$1</strong>") // Bold
      .replace(/_([^_]+)_/g, "<em>$1</em>") // Italic
      .replace(/~([^~]+)~/g, "<del>$1</del>"); // Strikethrough

    return { __html: safeText };
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Refocus after sending
  useEffect(() => {
    if (!sending && windowOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [sending, windowOpen]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent className="w-full sm:w-[420px] md:w-[560px] flex flex-col p-0 gap-0 sm:max-w-none shadow-2xl pointer-events-auto">

        <SheetHeader className="p-0 shrink-0 border-b border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#f0f2f5] text-[#111b21]">
            <div className="h-10 w-10 rounded-full bg-[#dfe5e7] flex items-center justify-center shrink-0 text-lg font-semibold overflow-hidden text-gray-500">
              <User className="h-6 w-6 mt-1 text-gray-400" />
            </div>

            <div className="flex-1 min-w-0">
              <SheetTitle className="text-[#111b21] text-base font-medium truncate m-0 p-0">
                {query?.name || "Customer"}
              </SheetTitle>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-[#54656f] text-xs">
                  <Phone className="h-3 w-3" /> {query?.phone}
                </span>
                {query?.email && (
                  <span className="flex items-center gap-1 text-[#54656f] text-xs truncate">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{query.email}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 text-[#54656f]">
              <button
                onClick={fetchConversation}
                className="p-2 rounded-full hover:bg-black/5 transition-colors"
                title="Refresh"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <div className="flex items-center gap-1 mr-1 ml-1" title="Live via WebSocket">
                <span className="h-2 w-2 rounded-full bg-[#00a884] animate-pulse" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#54656f]">Live</span>
              </div>
            </div>
          </div>

          {/* 24h window status bar */}
          <div className="px-4 py-2 bg-white border-b flex items-center justify-between gap-2 flex-wrap">
            <WindowStatusBadge
              windowOpen={windowOpen}
              windowExpiresAt={windowExpiresAt ?? query?.whatsappWindowExpiresAt}
            />
            {!windowOpen && query?._id && (
              <button
                className="text-xs text-green-700 underline hover:no-underline font-medium"
                onClick={() => setShowTemplatePicker(true)}
              >
                Send template
              </button>
            )}
          </div>

          {/* Complaint Context Banner */}
          {query && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
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
                  {query.createdAt && (
                    <div className="text-[10px] text-amber-600 mt-1">
                      Submitted {format(new Date(query.createdAt), "PPp")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetHeader>

        {/* ── Chat Body ── */}
        <div
          className="flex-1 overflow-y-auto px-4 py-3 bg-[#efeae2]"
          onScroll={handleScroll}
          ref={scrollRef as any}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1d7db' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-[#54656f]">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Loading messages...</span>
            </div>
          ) : groupedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[#54656f]">
              <div className="h-14 w-14 rounded-full bg-white/60 flex items-center justify-center shadow-sm">
                <MessageSquare className="h-7 w-7 text-[#54656f]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#111b21]">No messages yet</p>
                <p className="text-xs text-[#54656f] mt-1">
                  {query?.whatsappTemplateSentAt
                    ? "Ack template sent. Waiting for customer reply."
                    : "Send a message to start the conversation."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 pb-2">
              {groupedMessages.map(({ dateLabel, msgs }) => (
                <div key={dateLabel}>
                  <div className="flex items-center justify-center my-4">
                    <span className="bg-white/90 text-[#54656f] text-[11.5px] font-medium px-3 py-1 rounded-md shadow-sm">
                      {dateLabel.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {msgs.map((msg, i) => {
                      const isIncoming = msg.direction === "INCOMING";
                      const isNonText = msg.type !== "TEXT" && msg.type !== "OTHER";
                      const showTail = isIncoming ? (i === 0 || msgs[i - 1]?.direction !== "INCOMING") : (i === 0 || msgs[i - 1]?.direction !== "OUTGOING");

                      return (
                        <div
                          key={msg._id || i}
                          className={`flex items-end gap-1.5 ${isIncoming ? "justify-start" : "justify-end"}`}
                        >
                          <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isIncoming ? "items-start" : "items-end"}`}>
                            <div
                              className={`relative px-2.5 py-1.5 shadow-sm ${isIncoming
                                ? `bg-white text-[#111b21] rounded-lg ${showTail ? "rounded-tl-sm" : ""}`
                                : `bg-[#d9fdd3] text-[#111b21] rounded-lg ${showTail ? "rounded-tr-sm" : ""}`
                                }`}
                            >
                              {isNonText && (
                                <div className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full mb-1.5 ${getMsgTypeBadgeColor(msg.type)}`}>
                                  {getMsgTypeIcon(msg.type)}
                                  {msg.type}
                                </div>
                              )}
                              {msg.content && (
                                <div
                                  className="text-[14.5px] leading-snug whitespace-pre-wrap break-words"
                                  dangerouslySetInnerHTML={formatWhatsAppText(msg.content)}
                                />
                              )}
                              {renderMedia(msg)}
                              <div className={`flex items-center justify-end gap-1 mt-0.5 -mb-0.5 float-right ml-3 ${isIncoming ? "text-[#667781]" : "text-[#54656f]"}`}>
                                <span className="text-[10px]">{format(new Date(msg.timestamp), "HH:mm")}</span>
                                {!isIncoming && <CheckCheck className="h-[14px] w-[14px] text-[#53bdeb] -mr-0.5" />}
                              </div>
                              <div className="clear-both"></div>
                            </div>
                            {msg.messageId && (
                              <span className="text-[9px] text-[#667781] mt-0.5 font-mono px-1 truncate max-w-full" title={msg.messageId}>
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

        {/* ── Template Picker Overlay ── */}
        <TemplatePicker
          open={showTemplatePicker}
          onClose={() => setShowTemplatePicker(false)}
          onSend={handleSendTemplate}
        />

        {/* ── Footer ── */}
        <div className="px-3 py-2.5 bg-[#f0f2f5] border-t shrink-0">
          {sendError && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="font-medium">Error:</span>
              <span className="flex-1">{sendError}</span>
              <button className="text-red-400 hover:text-red-600 ml-auto" onClick={() => setSendError(null)}>✕</button>
            </div>
          )}

          {!windowOpen && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Session expired — only templates can be sent.</span>
              <button
                className="ml-auto text-amber-700 hover:text-amber-900 font-semibold underline"
                onClick={() => setShowTemplatePicker(true)}
              >
                Send template
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              id="support-chat-input"
              placeholder={windowOpen ? "Type a message..." : "Session expired — use templates"}
              value={replyText}
              onChange={(e) => {
                setReplyText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              disabled={sending || !windowOpen}
              rows={1}
              className="flex-1 rounded-xl bg-white border-0 shadow-sm focus-visible:ring-1 focus-visible:ring-[#00a884] text-[14.5px] px-4 py-3 min-h-[44px] max-h-[120px] resize-none disabled:cursor-not-allowed outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e as any);
                  if (textareaRef.current) {
                    textareaRef.current.style.height = "auto";
                  }
                }
              }}
            />
            {windowOpen ? (
              <Button
                type="submit"
                size="icon"
                disabled={sending || !replyText.trim()}
                className="rounded-full h-11 w-11 bg-[#00a884] hover:bg-[#008f6f] text-white shrink-0 shadow-sm transition-colors mb-0.5"
              >
                {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-1" />}
              </Button>
            ) : (
              <Button
                type="button"
                size="icon"
                onClick={() => setShowTemplatePicker(true)}
                className="rounded-full h-11 w-11 bg-amber-500 hover:bg-amber-600 text-white shrink-0 shadow-sm mb-0.5"
                title="Send Template"
              >
                <LayoutTemplate className="h-5 w-5" />
              </Button>
            )}
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
