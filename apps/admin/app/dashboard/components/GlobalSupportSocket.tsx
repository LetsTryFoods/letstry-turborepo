"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

const STORAGE_KEY = "support_unread_ids";

/**
 * GlobalSupportSocket — mounts once in the dashboard layout.
 * Stays connected across ALL admin pages so incoming WhatsApp
 * messages are never missed regardless of which page is open.
 *
 * Persists unread contact IDs to localStorage so red-dot badges
 * survive page refresh.
 *
 * Handles token refresh automatically so the connection survives
 * across sessions / the next day when the access token has expired.
 */
export function GlobalSupportSocket() {
  const socketRef = useRef<Socket | null>(null);

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

    /**
     * Try to get a fresh access token via the adminRefreshToken mutation.
     * Falls back to whatever is in localStorage if the refresh fails.
     */
    async function getToken(): Promise<string> {
      const stored =
        typeof window !== "undefined"
          ? (localStorage.getItem("token") ?? "")
          : "";

      try {
        const apiBase = baseUrl.endsWith("/api")
          ? baseUrl
          : `${baseUrl}/api`;
        const res = await fetch(`${apiBase}/graphql`, {
          method: "POST",
          credentials: "include", // sends the admin_refresh_token cookie
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: `mutation { adminRefreshToken }` }),
        });
        if (res.ok) {
          const json = await res.json();
          const newToken: string | undefined = json?.data?.adminRefreshToken;
          if (newToken) {
            localStorage.setItem("token", newToken);
            return newToken;
          }
        }
      } catch {
        // Refresh failed — fall back to stored token
      }

      return stored;
    }

    let destroyed = false;

    async function connectSocket() {
      if (destroyed) return;

      // Always get a fresh (or refreshed) token before connecting
      const token = await getToken();
      if (destroyed) return;

      const socket = io(`${socketUrl}/support`, {
        transports: ["websocket", "polling"],
        auth: { token },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 30_000,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("[GlobalSupportSocket] Connected:", socket.id);
      });

      socket.on("connect_error", (err) => {
        console.warn("[GlobalSupportSocket] connect_error:", err.message);
        // If auth-related, kill this socket and try again with a fresh token
        const isAuthError =
          err.message?.toLowerCase().includes("auth") ||
          err.message?.toLowerCase().includes("token") ||
          err.message?.toLowerCase().includes("unauthorized");
        if (isAuthError) {
          socket.disconnect();
          setTimeout(() => {
            if (!destroyed) connectSocket();
          }, 3000);
        }
      });

      socket.on("disconnect", (reason) => {
        console.log("[GlobalSupportSocket] Disconnected:", reason);
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
    }

    // Re-connect when the tab becomes visible (handles "return next day" case)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const socket = socketRef.current;
        if (!socket || !socket.connected) {
          console.log("[GlobalSupportSocket] Tab visible — reconnecting…");
          socket?.disconnect();
          connectSocket();
        }
      }
    };

    connectSocket();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      destroyed = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  return null; // renders nothing
}
