"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export const SaleAnnouncementBar = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if not dismissed in this session
    const dismissed = sessionStorage.getItem("sale-bar-dismissed");
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("sale-bar-dismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        background: "linear-gradient(90deg, #8b0000 0%, #c41a1a 40%, #8b0000 100%)",
        borderBottom: "2px solid #e8a020",
        position: "relative",
        zIndex: 50,
        overflow: "hidden",
      }}
    >
      {/* Shimmer line */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "60%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
          animation: "shimmer 3s infinite",
          pointerEvents: "none",
        }}
      />
      <style>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes pulse-gold {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.75; }
        }
      `}</style>

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "8px 48px 8px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {/* Fire emoji badge */}
        <span
          style={{
            background: "#e8a020",
            color: "#8b0000",
            fontWeight: 900,
            fontSize: 11,
            padding: "2px 10px",
            borderRadius: 20,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          🔥 Limited Time
        </span>

        <p
          style={{
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
            margin: 0,
            textAlign: "center",
          }}
        >
          Flat{" "}
          <span
            style={{
              color: "#f5c518",
              fontWeight: 900,
              fontSize: 16,
              animation: "pulse-gold 2s infinite",
              display: "inline-block",
            }}
          >
            60% OFF
          </span>{" "}
          on Limited Products — Traditional snacks before they&apos;re gone!
        </p>

        <Link
          href="/sale"
          style={{
            background: "#e8a020",
            color: "#8b0000",
            fontWeight: 800,
            fontSize: 12,
            padding: "4px 16px",
            borderRadius: 20,
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "background 0.2s",
          }}
        >
          Shop Now →
        </Link>
      </div>

      {/* Dismiss button */}
      <button
        onClick={dismiss}
        aria-label="Dismiss sale banner"
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.6)",
          fontSize: 18,
          cursor: "pointer",
          lineHeight: 1,
          padding: 4,
        }}
      >
        ×
      </button>
    </div>
  );
};
