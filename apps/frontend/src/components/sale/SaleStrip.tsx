import Link from "next/link";

export const SaleStrip = () => {
  return (
    <Link
      href="/sale"
      style={{ display: "block", textDecoration: "none" }}
      aria-label="Shop sale items"
    >
      <div
        style={{
          background: "linear-gradient(135deg, #8b0000 0%, #c41a1a 50%, #8b0000 100%)",
          borderTop: "2px solid #e8a020",
          borderBottom: "2px solid #e8a020",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(12px, 3vw, 40px)",
          flexWrap: "wrap",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative side starbursts */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "clamp(12px, 3vw, 48px)",
            fontSize: "clamp(24px, 4vw, 40px)",
            opacity: 0.3,
            userSelect: "none",
          }}
        >
          ✦
        </span>
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "clamp(12px, 3vw, 48px)",
            fontSize: "clamp(24px, 4vw, 40px)",
            opacity: 0.3,
            userSelect: "none",
          }}
        >
          ✦
        </span>

        <span
          style={{
            background: "#e8a020",
            color: "#8b0000",
            fontWeight: 900,
            fontSize: "clamp(11px, 1.4vw, 13px)",
            padding: "3px 14px",
            borderRadius: 20,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          🔥 Sale Live Now
        </span>

        <p
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: "clamp(14px, 2vw, 20px)",
            margin: 0,
            textAlign: "center",
          }}
        >
          Kaju Katli, Besan Barfi & more —{" "}
          <span style={{ color: "#f5c518" }}>Flat 60% OFF</span> on limited
          stock
        </p>

        <span
          style={{
            background: "#f5c518",
            color: "#8b0000",
            fontWeight: 800,
            fontSize: "clamp(12px, 1.5vw, 15px)",
            padding: "8px 24px",
            borderRadius: 30,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          }}
        >
          Grab Deals →
        </span>
      </div>
    </Link>
  );
};
