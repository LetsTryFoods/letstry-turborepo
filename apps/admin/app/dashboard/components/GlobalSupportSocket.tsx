"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";

const STORAGE_KEY = "support_unread_ids";

/**
 * GlobalSupportSocket — mounts once in the dashboard layout.
 * Stays connected across ALL admin pages so incoming WhatsApp
 * messages are never missed regardless of which page is open.
 *
 * Persists unread contact IDs to localStorage so red-dot badges
 * survive page refresh.
 */
export function GlobalSupportSocket() {
  useEffect(() => {
    const isDev = process.env.NODE_ENV !== "production";
    const fallbackUrl = isDev
      ? "http://localhost:3000"
      : "https://apiv3.letstryfoods.com";
    const baseUrl =
      process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      fallbackUrl;
    const socketUrl = baseUrl.replace(/\/api$/, "");

    const socket = io(`${socketUrl}/support`, {
      transports: ["websocket", "polling"],
      auth: {
        token:
          typeof window !== "undefined" ? localStorage.getItem("token") : "",
      },
    });

    socket.on("connect_error", (err) => {
      console.error("[GlobalSupportSocket] connect_error:", err.message);
    });

    socket.on(
      "new_global_message",
      (data: { contactQueryId: string; message: any }) => {
        if (data.message?.direction === "INCOMING") {
          // Persist to localStorage
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const ids: string[] = stored ? JSON.parse(stored) : [];
            if (!ids.includes(data.contactQueryId)) {
              ids.push(data.contactQueryId);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
            }
          } catch {
            // ignore
          }

          // Toast notification (visible on any page)
          const msgPreview = data.message?.content
            ? String(data.message.content).slice(0, 60)
            : "New WhatsApp message";
          toast("💬 New WhatsApp Message", {
            description: msgPreview,
            duration: 6000,
            action: {
              label: "View",
              onClick: () => {
                window.location.href = "/dashboard/contact";
              },
            },
          });
        }
      }
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  return null; // renders nothing
}
