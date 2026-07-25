"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  Search,
  ScanBarcode,
  XCircle,
  X,
  ZoomIn,
  RefreshCw,
  Package,
  Phone,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAllOrders, Order } from "@/lib/orders/queries";
import { useLazyQuery } from "@apollo/client/react";
import { GET_ALL_ORDERS } from "@/lib/graphql/orders";
import { OrderDetailsDialog } from "../orders/components/OrderDetailsDialog";

import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LabelEntry {
  id: string;
  file: File;
  preview: string;
  awbNumber: string | null;
  scanning: boolean;
  scanError: string | null;
  isDuplicate?: boolean;
  duplicateInfo?: { orderDisplayId: string; phone?: string; sentAt?: string } | null;
  orderId: string | null;
  orderDisplayId: string | null;
  customerPhone: string | null;
  customerName: string | null;
  orderDate: string | null;
  sending: boolean;
  sent: boolean;
  sendError: string | null;
}

// ─── High-Precision 1D Barcode Scanner Engine (ZXing) ──────────────────────────

function cleanAwbText(text: string): string | null {
  if (!text) return null;
  // Ignore URLs or Play Store links
  if (
    text.includes("http://") ||
    text.includes("https://") ||
    text.includes("play.google") ||
    text.includes("apple.com")
  ) {
    return null;
  }

  const cleaned = text.trim().toUpperCase().replace(/\s+/g, "");

  // Match AWB patterns (e.g. Z4000446481, D3009078682, or 8-15 char alphanumeric)
  const match = cleaned.match(/\b([A-Z0-9]{8,15})\b/);
  if (match) return match[1];

  if (/^[A-Z0-9]{7,16}$/.test(cleaned)) return cleaned;
  return null;
}

function rotateCanvas(
  sourceCanvas: HTMLCanvasElement,
  degrees: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const rad = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));

  canvas.width = Math.round(sourceCanvas.width * cos + sourceCanvas.height * sin);
  canvas.height = Math.round(sourceCanvas.width * sin + sourceCanvas.height * cos);

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(
    sourceCanvas,
    -sourceCanvas.width / 2,
    -sourceCanvas.height / 2
  );
  return canvas;
}

function contrastEnhanceCanvas(
  sourceCanvas: HTMLCanvasElement
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(sourceCanvas, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const factor = 2.0;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const v = factor * (avg - 128) + 128;
    const clamped = Math.max(0, Math.min(255, v));
    data[i] = clamped;
    data[i + 1] = clamped;
    data[i + 2] = clamped;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function createQuadrantCrops(
  sourceCanvas: HTMLCanvasElement
): HTMLCanvasElement[] {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const halfW = Math.floor(w / 2);
  const halfH = Math.floor(h / 2);

  const rects = [
    { x: 0, y: 0, w: halfW, h: halfH }, // Top-Left
    { x: halfW, y: 0, w: halfW, h: halfH }, // Top-Right (common for AWB)
    { x: 0, y: halfH, w: halfW, h: halfH }, // Bottom-Left
    { x: halfW, y: halfH, w: halfW, h: halfH }, // Bottom-Right
    { x: Math.floor(w * 0.2), y: 0, w: Math.floor(w * 0.6), h: h }, // Center Column
    { x: 0, y: Math.floor(h * 0.2), w: w, h: Math.floor(h * 0.6) }, // Center Row
  ];

  return rects.map((r) => {
    const c = document.createElement("canvas");
    c.width = r.w;
    c.height = r.h;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(sourceCanvas, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
    return c;
  });
}

async function scanBarcode(file: File): Promise<string | null> {
  try {
    const {
      MultiFormatReader,
      DecodeHintType,
      BarcodeFormat,
      HTMLCanvasElementLuminanceSource,
      HybridBinarizer,
      GlobalHistogramBinarizer,
      BinaryBitmap,
    } = await import("@zxing/library");

    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93,
      BarcodeFormat.ITF,
      BarcodeFormat.CODABAR,
      BarcodeFormat.EAN_13,
    ]);

    const reader = new MultiFormatReader();
    reader.setHints(hints);

    const tryDecodeCanvas = (canvas: HTMLCanvasElement): string | null => {
      try {
        const source = new HTMLCanvasElementLuminanceSource(canvas);

        // Pass A: HybridBinarizer (handles tape glare & reflections)
        try {
          const bitmap = new BinaryBitmap(new HybridBinarizer(source));
          const res = reader.decode(bitmap);
          const awb = cleanAwbText(res?.getText() || "");
          if (awb) return awb;
        } catch {}

        // Pass B: GlobalHistogramBinarizer (handles dark/low-contrast photos)
        try {
          const bitmap = new BinaryBitmap(new GlobalHistogramBinarizer(source));
          const res = reader.decode(bitmap);
          const awb = cleanAwbText(res?.getText() || "");
          if (awb) return awb;
        } catch {}
      } catch {}
      return null;
    };

    const url = URL.createObjectURL(file);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = url;
    });

    let w = img.naturalWidth;
    let h = img.naturalHeight;
    const maxDim = 1200;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }

    const baseCanvas = document.createElement("canvas");
    baseCanvas.width = w;
    baseCanvas.height = h;
    const ctx = baseCanvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);

    // Fine rotation angles to align slanted/tilted camera photos perfectly horizontal
    const angles = [
      0, 90, 180, 270,
      15, 30, 45, 60, 75,
      105, 120, 135, 150, 165,
      195, 210, 225, 240, 255,
      285, 300, 315, 330, 345,
    ];

    // Pass 1: Try raw image across fine angles
    for (const angle of angles) {
      const rotated = angle === 0 ? baseCanvas : rotateCanvas(baseCanvas, angle);
      const awb = tryDecodeCanvas(rotated);
      if (awb) return awb;
    }

    // Pass 2: Contrast enhanced image across fine angles
    const enhanced = contrastEnhanceCanvas(baseCanvas);
    for (const angle of angles) {
      const rotated = angle === 0 ? enhanced : rotateCanvas(enhanced, angle);
      const awb = tryDecodeCanvas(rotated);
      if (awb) return awb;
    }

    // Pass 3: Quadrant crops (isolates barcode from large blocks of text)
    const crops = createQuadrantCrops(baseCanvas);
    for (const crop of crops) {
      for (const angle of [0, 90, 180, 270, 15, 75, 105, 165]) {
        const rotated = angle === 0 ? crop : rotateCanvas(crop, angle);
        const awb = tryDecodeCanvas(rotated);
        if (awb) return awb;
      }
    }

    return null;
  } catch {
    return null;
  }
}

// ─── Order search dropdown ────────────────────────────────────────────────────

function OrderSearchBox({ onSelect }: { onSelect: (order: any) => void }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(val), 400);
  };

  const { orders, loading } = useAllOrders(
    debouncedQuery.length >= 2 ? { userSearch: debouncedQuery, limit: 8 } : { limit: 0 }
  );

  return (
    <div className="relative">
      <div className="flex items-center gap-1 border rounded-md px-2 bg-background">
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search order ID / phone / name…"
          className="border-0 h-8 text-xs focus-visible:ring-0 px-1"
        />
        {loading && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground shrink-0" />
        )}
      </div>
      {debouncedQuery.length >= 2 && orders.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-background border rounded-md shadow-lg max-h-52 overflow-y-auto">
          {orders.map((order: any) => {
            const phone =
              order.shippingAddress?.phone ||
              order.userInfo?.phoneNumber ||
              order.customer?.phone ||
              "—";
            const name =
              order.shippingAddress?.fullName ||
              order.customer?.name ||
              `${order.userInfo?.firstName || ""} ${order.userInfo?.lastName || ""}`.trim() ||
              "Customer";
            return (
              <button
                key={order._id}
                onClick={() => {
                  onSelect({ ...order, _resolvedPhone: phone, _resolvedName: name });
                  setQuery("");
                  setDebouncedQuery("");
                }}
                className="w-full text-left px-3 py-2 hover:bg-accent text-xs flex flex-col gap-0.5 border-b last:border-0"
              >
                <span className="font-medium">{order.orderId}</span>
                <span className="text-muted-foreground">
                  {name} · {phone}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {debouncedQuery.length >= 2 && !loading && orders.length === 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-background border rounded-md shadow-md px-3 py-2 text-xs text-muted-foreground">
          No orders found
        </div>
      )}
    </div>
  );
}

// ─── Image Lightbox ───────────────────────────────────────────────────────────

function ImageLightbox({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X className="h-7 w-7" />
        </button>
        <img
          src={src}
          alt="Label full view"
          className="w-full h-full object-contain rounded-lg shadow-2xl max-h-[85vh]"
        />
      </div>
    </div>
  );
}

// ─── Single label row ─────────────────────────────────────────────────────────

function LabelRow({
  entry,
  onRescan,
  onLinkOrder,
  onSend,
  onUnlink,
  onManualAwb,
  onRemove,
}: {
  entry: LabelEntry;
  onRescan: (id: string) => void;
  onLinkOrder: (id: string, order: any) => void;
  onSend: (id: string) => void;
  onUnlink: (id: string) => void;
  onManualAwb: (id: string, awb: string) => void;
  onRemove: (id: string) => void;
}) {
  const [manualAwb, setManualAwb] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      {lightboxOpen && (
        <ImageLightbox
          src={entry.preview}
          onClose={() => setLightboxOpen(false)}
        />
      )}
      <div className="relative flex flex-col sm:flex-row gap-3 p-3 pr-10 border rounded-lg bg-card hover:bg-accent/20 transition-colors items-center sm:items-stretch">
        {/* Remove (Cross) Button */}
        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Remove photo"
        >
          <X className="h-4 w-4" />
        </button>
        {/* Thumbnail — click to enlarge */}
        <div className="relative shrink-0 group">
          <img
            src={entry.preview}
            alt="Label"
            onClick={() => setLightboxOpen(true)}
            className="w-28 h-20 object-cover rounded border cursor-zoom-in"
          />
          <div
            onClick={() => setLightboxOpen(true)}
            className="absolute inset-0 flex items-center justify-center rounded bg-black/0 group-hover:bg-black/30 transition-colors cursor-zoom-in"
          >
            <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {entry.scanning && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded">
              <Loader2 className="h-5 w-5 text-white animate-spin" />
            </div>
          )}
        </div>

      {/* AWB section */}
      <div className="flex flex-col gap-1.5 justify-center min-w-[9rem]">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
          AWB Number
        </p>
        {entry.scanning ? (
          <span className="text-xs text-muted-foreground">Scanning…</span>
        ) : entry.awbNumber ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <ScanBarcode className="h-4 w-4 text-green-600 shrink-0" />
              <span className="font-mono text-sm font-bold text-green-700">
                {entry.awbNumber}
              </span>
            </div>
            {entry.isDuplicate && (
              <Badge
                variant="outline"
                className="text-amber-800 bg-amber-50 border-amber-300 text-[10px] py-0.5 px-1.5 flex items-center gap-1 shrink-0 font-medium w-fit"
              >
                <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
                <span>Already Processed</span>
              </Badge>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-destructive">Scan failed</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-1.5"
                onClick={() => onRescan(entry.id)}
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Retry
              </Button>
            </div>
            <div className="flex gap-1">
              <Input
                placeholder="Manual AWB…"
                className="h-7 text-xs font-mono"
                value={manualAwb}
                onChange={(e) => setManualAwb(e.target.value)}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs px-2"
                disabled={!manualAwb.trim()}
                onClick={() => {
                  onManualAwb(entry.id, manualAwb.trim());
                  setManualAwb("");
                }}
              >
                Set
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order link section */}
      <div className="flex-1 flex flex-col gap-1.5 justify-center">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
          Order
        </p>
        {entry.orderId ? (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded px-2 py-1">
              <Package className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">
                {entry.orderDisplayId}
              </span>
            </div>
            {entry.customerName && (
              <span className="text-xs text-muted-foreground">
                {entry.customerName}
              </span>
            )}
            {entry.customerPhone && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                {entry.customerPhone}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-1.5 text-muted-foreground"
              onClick={() => onUnlink(entry.id)}
            >
              Change
            </Button>
          </div>
        ) : (
          <OrderSearchBox onSelect={(order) => onLinkOrder(entry.id, order)} />
        )}
      </div>

      {/* Send button */}
      <div className="flex flex-col items-end justify-center gap-1 shrink-0">
        {entry.sent ? (
          <div className="flex items-center gap-1.5 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Sent!</span>
          </div>
        ) : entry.isDuplicate ? (
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant="outline"
              className="bg-amber-100 text-amber-900 border-amber-300 gap-1 text-xs py-1 px-2.5 font-medium"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>Already Sent</span>
            </Badge>
            {entry.duplicateInfo?.orderDisplayId && (
              <span className="text-[10px] text-amber-700 font-medium">
                For {entry.duplicateInfo.orderDisplayId}
              </span>
            )}
          </div>
        ) : (
          <Button
            onClick={() => onSend(entry.id)}
            disabled={
              !entry.awbNumber ||
              !entry.orderId ||
              entry.sending ||
              entry.scanning
            }
            size="sm"
            className="gap-1.5"
          >
            {entry.sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
            {entry.sending ? "Sending…" : "Send WA"}
          </Button>
        )}
        {entry.sendError && (
          <p className="text-xs text-destructive text-right max-w-32">
            {entry.sendError}
          </p>
        )}
      </div>
    </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LabelScannerPage() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        allowedFileTypes: ["image/jpeg", "image/png", "image/webp"],
        maxFileSize: 20 * 1024 * 1024,
      },
      autoProceed: false,
    })
  );
  const [entries, setEntries] = useState<LabelEntry[]>([]);

  const [existingLogs, setExistingLogs] = useState<any[]>([]);
  const existingLogsRef = useRef<any[]>([]);
  const entriesRef = useRef<LabelEntry[]>([]);

  entriesRef.current = entries;
  existingLogsRef.current = existingLogs;

  const fetchExistingLogs = useCallback(async () => {
    try {
      const res = await api.get("/shipments/label-scan-logs?limit=500");
      const loaded = res.data.logs || [];
      setExistingLogs(loaded);
    } catch {}
  }, []);

  useEffect(() => {
    fetchExistingLogs();
  }, [fetchExistingLogs]);

  const scan = useCallback(async (entryId: string, file: File) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId ? { ...e, scanning: true, scanError: null } : e
      )
    );
    const awb = await scanBarcode(file);

    let isDuplicate = false;
    let duplicateInfo: { orderDisplayId: string; phone?: string; sentAt?: string } | null = null;

    if (awb) {
      // 1. Check in database history logs
      const historyMatch = existingLogsRef.current.find((l) => l.awbNumber === awb);
      if (historyMatch) {
        isDuplicate = true;
        duplicateInfo = {
          orderDisplayId: historyMatch.orderDisplayId,
          phone: historyMatch.recipientPhone,
          sentAt: historyMatch.createdAt,
        };
      } else {
        // 2. Check in current uploaded entries batch
        const batchMatch = entriesRef.current.find((e) => e.id !== entryId && e.awbNumber === awb);
        if (batchMatch) {
          isDuplicate = true;
          duplicateInfo = {
            orderDisplayId: batchMatch.orderDisplayId || "Current Batch",
            phone: batchMatch.customerPhone || undefined,
          };
        }
      }
    }

    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? {
              ...e,
              scanning: false,
              awbNumber: awb,
              scanError: awb ? null : "No barcode detected",
              isDuplicate,
              duplicateInfo,
              // If duplicate, auto-fill display ID so user knows immediately
              ...(duplicateInfo?.orderDisplayId
                ? { orderDisplayId: duplicateInfo.orderDisplayId }
                : {}),
            }
          : e
      )
    );
  }, []);

  const processingQueueRef = useRef<{ id: string; file: File }[]>([]);
  const activeCountRef = useRef(0);

  const processNextInQueue = useCallback(async () => {
    if (activeCountRef.current >= 2 || processingQueueRef.current.length === 0) {
      return;
    }

    const task = processingQueueRef.current.shift();
    if (!task) return;

    activeCountRef.current++;
    try {
      await scan(task.id, task.file);
    } finally {
      activeCountRef.current--;
      setTimeout(() => {
        processNextInQueue();
      }, 30);
    }
  }, [scan]);

  const enqueueScan = useCallback(
    (id: string, file: File) => {
      processingQueueRef.current.push({ id, file });
      processNextInQueue();
      processNextInQueue();
    },
    [processNextInQueue]
  );

  useEffect(() => {
    if (!dashboardRef.current || uppy.getPlugin("Dashboard")) return;

    uppy.use(Dashboard, {
      inline: true,
      target: dashboardRef.current,
      height: 260,
      theme: "light",
      width: "100%",
      hideUploadButton: true,
      proudlyDisplayPoweredByUppy: false,
      showSelectedFiles: false,
      note: "Select JPEG, PNG, or WebP label photos",
    });

    const handleAdded = (file: any) => {
      const preview = URL.createObjectURL(file.data);
      setEntries((prev) => [
        ...prev,
        {
          id: file.id,
          file: file.data,
          preview,
          awbNumber: null,
          scanning: true,
          scanError: null,
          orderId: null,
          orderDisplayId: null,
          customerPhone: null,
          customerName: null,
          orderDate: null,
          sending: false,
          sent: false,
          sendError: null,
        },
      ]);
      enqueueScan(file.id, file.data);
    };

    const handleRemoved = (file: any) => {
      processingQueueRef.current = processingQueueRef.current.filter((t) => t.id !== file.id);
      setEntries((prev) => prev.filter((e) => e.id !== file.id));
    };

    uppy.on("file-added", handleAdded);
    uppy.on("file-removed", handleRemoved);

    return () => {
      uppy.off("file-added", handleAdded);
      uppy.off("file-removed", handleRemoved);
    };
  }, [uppy, scan]);

  const handleRescan = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) scan(id, entry.file);
  };

  const handleManualAwb = (id: string, awb: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, awbNumber: awb, scanError: null } : e
      )
    );
  };

  const handleLinkOrder = (id: string, order: any) => {
    const phone =
      order._resolvedPhone ||
      order.shippingAddress?.phone ||
      order.userInfo?.phoneNumber ||
      order.customer?.phone ||
      null;
    const name =
      order._resolvedName ||
      order.shippingAddress?.fullName ||
      order.customer?.name ||
      `${order.userInfo?.firstName || ""} ${order.userInfo?.lastName || ""}`.trim() ||
      "Customer";
    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : null;

    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              orderId: order.orderId,
              orderDisplayId: order.orderId,
              customerPhone: phone,
              customerName: name,
              orderDate,
              sent: false,
              sendError: null,
            }
          : e
      )
    );
  };

  const handleUnlink = (id: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              orderId: null,
              orderDisplayId: null,
              customerPhone: null,
              customerName: null,
              orderDate: null,
              sent: false,
              sendError: null,
            }
          : e
      )
    );
  };

  const [logsRefreshKey, setLogsRefreshKey] = useState(0);

  const handleSend = async (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry?.awbNumber || !entry?.orderId) return;

    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, sending: true, sendError: null } : e))
    );
    try {
      await api.post("/shipments/manual-awb-notify", {
        awbNumber: entry.awbNumber,
        orderId: entry.orderId,
        scanType: entry.scanError ? "MANUAL_INPUT" : "AUTO_BARCODE",
        ...(entry.customerPhone ? { phoneNumber: entry.customerPhone } : {}),
        ...(entry.orderDate ? { orderDate: entry.orderDate } : {}),
      });
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, sending: false, sent: true } : e))
      );
      setLogsRefreshKey((prev) => prev + 1);
      toast.success(`✅ WhatsApp sent — AWB ${entry.awbNumber}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to send WhatsApp notification";
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, sending: false, sendError: msg } : e))
      );
      toast.error(msg);
    }
  };

  const handleSendAll = async () => {
    const pending = entries.filter(
      (e) => e.awbNumber && e.orderId && !e.sent && !e.sending
    );
    for (const e of pending) await handleSend(e.id);
  };

  const pendingCount = entries.filter(
    (e) => e.awbNumber && e.orderId && !e.sent
  ).length;
  const sentCount = entries.filter((e) => e.sent).length;

  const handleRemove = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      uppy.removeFile(id);
    } catch {}
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ScanBarcode className="h-6 w-6 text-primary" />
            Label Scanner
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upload label photos → Auto-scan AWB → Link order → Send WhatsApp notification
          </p>
        </div>
        {pendingCount > 0 && (
          <Button onClick={handleSendAll} className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Send All ({pendingCount})
          </Button>
        )}
      </div>

      {/* Stats */}
      {entries.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline">{entries.length} Labels</Badge>
          <Badge
            variant="outline"
            className="text-green-700 border-green-300 bg-green-50"
          >
            {entries.filter((e) => e.awbNumber).length} AWBs scanned
          </Badge>
          <Badge
            variant="outline"
            className="text-blue-700 border-blue-300 bg-blue-50"
          >
            {entries.filter((e) => e.orderId).length} Orders linked
          </Badge>
          {sentCount > 0 && (
            <Badge className="bg-green-600 text-white">
              {sentCount} WhatsApp sent ✓
            </Badge>
          )}
        </div>
      )}

      {/* Uppy uploader */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            📷 Upload Label Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={dashboardRef} className="rounded-lg border overflow-hidden" />
        </CardContent>
      </Card>

      {/* Label rows */}
      {entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              🏷️ Labels ({entries.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.map((entry) => (
              <LabelRow
                key={entry.id}
                entry={entry}
                onRescan={handleRescan}
                onLinkOrder={handleLinkOrder}
                onSend={handleSend}
                onUnlink={handleUnlink}
                onManualAwb={handleManualAwb}
                onRemove={handleRemove}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {entries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card/50">
          <ScanBarcode className="h-10 w-10 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Upload shipping label photos above to get started</p>
        </div>
      )}

      {/* Scan History Audit Logs */}
      <HistoryScanLogs refreshKey={logsRefreshKey} />
    </div>
  );
}

// ─── Scan History Audit Logs Table Component ──────────────────────────────────

function HistoryScanLogs({ refreshKey }: { refreshKey: number }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Order Details Modal state
  const [fetchOrder] = useLazyQuery(GET_ALL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fetchingOrderId, setFetchingOrderId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/shipments/label-scan-logs?limit=50");
      setLogs(res.data.logs || []);
      setTotalCount(res.data.totalCount || 0);
    } catch {
      toast.error("Failed to load scan history logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, refreshKey]);

  const handleOrderClick = async (orderDisplayId: string) => {
    setFetchingOrderId(orderDisplayId);
    try {
      const res = await fetchOrder({
        variables: { input: { userSearch: orderDisplayId, limit: 1 } },
      });
      const found = (res.data as any)?.getAllOrders?.orders?.[0];
      if (found) {
        setSelectedOrder(found);
        setDialogOpen(true);
      } else {
        toast.error(`Order details not found for ${orderDisplayId}`);
      }
    } catch {
      toast.error("Failed to load order details");
    } finally {
      setFetchingOrderId(null);
    }
  };

  return (
    <>
      <OrderDetailsDialog
        order={selectedOrder}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            📋 Saved Scan History ({totalCount})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            className="gap-1.5 text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Loading scan logs…</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              No scan history logs recorded yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground font-medium text-left">
                    <th className="py-2 px-3">Date & Time</th>
                    <th className="py-2 px-3">AWB Number</th>
                    <th className="py-2 px-3">Order ID</th>
                    <th className="py-2 px-3">Phone</th>
                    <th className="py-2 px-3">Scan Mode</th>
                    <th className="py-2 px-3 text-right">WhatsApp Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log: any) => {
                    const d = log.createdAt ? new Date(log.createdAt) : null;
                    const dateStr = d
                      ? d.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—";

                    return (
                      <tr key={log._id} className="hover:bg-accent/10">
                        <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground font-mono">
                          {dateStr}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-green-700">
                          {log.awbNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => handleOrderClick(log.orderDisplayId)}
                            disabled={fetchingOrderId === log.orderDisplayId}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 group text-xs text-left"
                            title="Click to view order details"
                          >
                            <span>{log.orderDisplayId}</span>
                            {fetchingOrderId === log.orderDisplayId ? (
                              <Loader2 className="h-3 w-3 animate-spin text-blue-600 shrink-0" />
                            ) : (
                              <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                            )}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {log.recipientPhone || "—"}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge
                            variant="outline"
                            className={
                              log.scanType === "MANUAL_INPUT"
                                ? "text-amber-700 bg-amber-50 border-amber-200"
                                : "text-blue-700 bg-blue-50 border-blue-200"
                            }
                          >
                            {log.scanType === "MANUAL_INPUT"
                              ? "Manual Input"
                              : "Auto Barcode"}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Sent
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}


