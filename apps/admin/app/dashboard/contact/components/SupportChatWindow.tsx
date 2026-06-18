"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Image as ImageIcon, FileText, Loader2 } from "lucide-react";
import { ContactQuery } from "@/lib/contact/useContact";
import { format } from "date-fns";

interface SupportChatWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: ContactQuery | null;
}

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && query?.phone) {
      fetchChatHistory();
    }
  }, [open, query]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchChatHistory = async () => {
    if (!query?.phone) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL}/whatsapp-chat/${query.phone}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to fetch chat history", err);
    } finally {
      setLoading(false);
    }
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
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ message: replyText, contactId: query._id }),
        },
      );

      const data = await res.json();
      if (res.ok && data.success && data.message) {
        setSendError(null);
        setMessages((prev) => [...prev, data.message]);
        setReplyText("");
      } else {
        const errMsg = data?.error || "Failed to send message";
        setSendError(errMsg);
        console.error("Send failed:", errMsg);
      }
    } catch (err: any) {
      setSendError(err?.message || "Network error — could not send message.");
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const renderMedia = (msg: any) => {
    if (!msg.mediaUrl) return null;

    if (msg.type === "IMAGE") {
      return (
        <img
          src={msg.mediaUrl}
          alt="WhatsApp Image"
          className="max-w-[200px] rounded-md mt-2 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(msg.mediaUrl, "_blank")}
        />
      );
    } else if (msg.type === "VIDEO") {
      return (
        <video
          src={msg.mediaUrl}
          controls
          className="max-w-[200px] rounded-md mt-2"
        />
      );
    } else if (msg.type === "AUDIO") {
      return (
        <audio src={msg.mediaUrl} controls className="mt-2 max-w-[200px]" />
      );
    } else if (msg.type === "DOCUMENT") {
      return (
        <a
          href={msg.mediaUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 mt-2 p-2 bg-black/10 rounded-md text-sm hover:bg-black/20"
        >
          <FileText className="h-4 w-4" />
          {msg.content || "Download Document"}
        </a>
      );
    }
    return null;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
        <SheetHeader className="p-4 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            WhatsApp Support
            <span className="text-sm font-normal text-muted-foreground ml-auto">
              {query?.name} ({query?.phone})
            </span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4 bg-slate-50/50" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {/* Context Card */}
            {query && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-900 shadow-sm">
                <div className="font-semibold mb-1 flex items-center gap-2">
                  Complaint Context
                </div>
                <p>{query.message}</p>
                <div className="text-xs text-yellow-700/70 mt-2">
                  Submitted: {format(new Date(query.createdAt), "PPp")}
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              messages.map((msg, i) => {
                const isIncoming = msg.direction === "INCOMING";
                return (
                  <div
                    key={msg._id || i}
                    className={`flex flex-col ${isIncoming ? "items-start" : "items-end"
                      }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${isIncoming
                        ? "bg-white border text-slate-800 rounded-bl-none"
                        : "bg-green-600 text-white rounded-br-none"
                        }`}
                    >
                      {msg.content && <p className="text-sm">{msg.content}</p>}
                      {renderMedia(msg)}
                      <div
                        className={`text-[10px] mt-1 text-right ${isIncoming ? "text-slate-400" : "text-green-200"
                          }`}
                      >
                        {format(new Date(msg.timestamp), "p")}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {messages.length === 0 && !loading && (
              <div className="text-center text-sm text-muted-foreground p-8">
                No previous chat history found. Send a message to start the
                conversation.
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-white border-t shrink-0">
          {sendError && (
            <div className="mb-2 flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              <span className="font-semibold">⚠ Send failed:</span>
              <span>{sendError}</span>
              <button
                className="ml-auto text-red-400 hover:text-red-600"
                onClick={() => setSendError(null)}
              >
                ✕
              </button>
            </div>
          )}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2"
          >
            <Input
              placeholder="Type a message..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={sending}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={sending || !replyText.trim()}
              className="bg-green-600 hover:bg-green-700 text-white shrink-0"
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
