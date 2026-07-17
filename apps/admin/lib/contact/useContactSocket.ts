"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const isDev = process.env.NODE_ENV !== "production";
const fallbackUrl = isDev ? "http://localhost:3000" : "https://apiv3.letstryfoods.com";
const baseUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || fallbackUrl;
const SOCKET_URL = baseUrl.replace(/\/api$/, "");

interface UseContactSocketOptions {
  contactQueryId: string | null;
  onNewMessage: (message: any) => void;
  onWindowUpdated: (windowExpiresAt: string) => void;
  enabled?: boolean;
}

/**
 * Hook that manages a Socket.IO connection to the /support namespace.
 * Automatically joins the contact room and subscribes to events.
 * Cleans up (leave room, disconnect) on unmount or when contactQueryId changes.
 */
export function useContactSocket({
  contactQueryId,
  onNewMessage,
  onWindowUpdated,
  enabled = true,
}: UseContactSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const currentRoomRef = useRef<string | null>(null);

  const stableOnNewMessage = useCallback(onNewMessage, []); // eslint-disable-line
  const stableOnWindowUpdated = useCallback(onWindowUpdated, []); // eslint-disable-line

  useEffect(() => {
    if (!enabled || !contactQueryId) return;

    // Create socket if not already connected
    if (!socketRef.current) {
      socketRef.current = io(`${SOCKET_URL}/support`, {
        transports: ["websocket"],
        auth: {
          token: typeof window !== "undefined" ? localStorage.getItem("token") : "",
        },
      });

      socketRef.current.on("connect", () => {
        console.log("[SupportSocket] Connected:", socketRef.current?.id);
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("[SupportSocket] Disconnected:", reason);
      });
    }

    const socket = socketRef.current;

    // Leave previous room if switching contacts
    if (currentRoomRef.current && currentRoomRef.current !== contactQueryId) {
      socket.emit("leave_contact_room", currentRoomRef.current);
    }

    // Join new room
    socket.emit("join_contact_room", contactQueryId);
    currentRoomRef.current = contactQueryId;

    // Subscribe to events
    const handleNewMessage = (data: { contactQueryId: string; message: any }) => {
      if (data.contactQueryId === contactQueryId) {
        stableOnNewMessage(data.message);
      }
    };

    const handleWindowUpdated = (data: { contactQueryId: string; windowExpiresAt: string }) => {
      if (data.contactQueryId === contactQueryId) {
        stableOnWindowUpdated(data.windowExpiresAt);
      }
    };

    socket.on("new_contact_message", handleNewMessage);
    socket.on("window_updated", handleWindowUpdated);

    return () => {
      socket.off("new_contact_message", handleNewMessage);
      socket.off("window_updated", handleWindowUpdated);
    };
  }, [contactQueryId, enabled, stableOnNewMessage, stableOnWindowUpdated]);

  // Cleanup socket on full unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        currentRoomRef.current = null;
      }
    };
  }, []);

  return {
    isConnected: socketRef.current?.connected ?? false,
  };
}
