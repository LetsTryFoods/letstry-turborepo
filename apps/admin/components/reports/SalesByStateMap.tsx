"use client";

import { useState, useMemo } from "react";
import India from "@react-map/india";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { StateSales } from "@/lib/reports/useReports";
import { formatCurrency } from "@/lib/reports/useReports";

// ---------------------------------------------------------------------------
// EXACT state names as used inside @react-map/india bundle
// (extracted from node_modules/@react-map/india/dist/index.js)
// ---------------------------------------------------------------------------
const ALL_LIBRARY_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli",
  "Daman and Diu",
  "Delhi",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",   // ← exact key (not "Jammu & Kashmir")
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",              // ← separate from J&K in this library
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

// ---------------------------------------------------------------------------
// Map DB state names → exact library state names
// ---------------------------------------------------------------------------
const DB_TO_LIBRARY: Record<string, string> = {
  "andaman and nicobar": "Andaman and Nicobar Islands",
  "andaman & nicobar": "Andaman and Nicobar Islands",
  "andaman and nicobar islands": "Andaman and Nicobar Islands",
  "andaman & nicobar islands": "Andaman and Nicobar Islands",
  "andaman and nicobar island": "Andaman and Nicobar Islands",
  "andhra pradesh": "Andhra Pradesh",
  "arunachal pradesh": "Arunachal Pradesh",
  assam: "Assam",
  bihar: "Bihar",
  chandigarh: "Chandigarh",
  chhattisgarh: "Chhattisgarh",
  "dadra and nagar haveli": "Dadra and Nagar Haveli",
  "dadra & nagar haveli": "Dadra and Nagar Haveli",
  "dadra and nagar haveli and daman and diu": "Dadra and Nagar Haveli",
  "daman and diu": "Daman and Diu",
  "daman & diu": "Daman and Diu",
  delhi: "Delhi",
  "new delhi": "Delhi",
  goa: "Goa",
  gujarat: "Gujarat",
  haryana: "Haryana",
  "himachal pradesh": "Himachal Pradesh",
  "jammu and kashmir": "Jammu and Kashmir",
  "jammu & kashmir": "Jammu and Kashmir",
  "j&k": "Jammu and Kashmir",
  jharkhand: "Jharkhand",
  karnataka: "Karnataka",
  kerala: "Kerala",
  ladakh: "Ladakh",
  lakshadweep: "Lakshadweep",
  "madhya pradesh": "Madhya Pradesh",
  maharashtra: "Maharashtra",
  manipur: "Manipur",
  meghalaya: "Meghalaya",
  mizoram: "Mizoram",
  nagaland: "Nagaland",
  odisha: "Odisha",
  orissa: "Odisha",
  puducherry: "Puducherry",
  pondicherry: "Puducherry",
  punjab: "Punjab",
  rajasthan: "Rajasthan",
  sikkim: "Sikkim",
  "tamil nadu": "Tamil Nadu",
  telangana: "Telangana",
  tripura: "Tripura",
  "uttar pradesh": "Uttar Pradesh",
  uttarakhand: "Uttarakhand",
  "west bengal": "West Bengal",
};

function toLibraryName(raw: string): string {
  return DB_TO_LIBRARY[raw.trim().toLowerCase()] ?? raw.trim();
}

// ---------------------------------------------------------------------------
// Color: no orders → red-300, has orders → green gradient (low→high)
// ---------------------------------------------------------------------------
function getColor(orders: number, max: number): string {
  if (!orders || max === 0) return "#fca5a5"; // red-300
  const t = Math.pow(orders / max, 0.5);
  const r = Math.round(220 - t * (220 - 21));
  const g = Math.round(252 - t * (252 - 128));
  const b = Math.round(231 - t * (231 - 61));
  return `rgb(${r},${g},${b})`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface SalesByStateMapProps {
  stateData: StateSales[];
  loading: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function SalesByStateMap({
  stateData,
  loading,
}: SalesByStateMapProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mapSize, setMapSize] = useState(560);
  const [sortBy, setSortBy] = useState<"orders" | "revenue">("orders");

  const zoomIn = () => setMapSize((s) => Math.min(s + 80, 1200));
  const zoomOut = () => setMapSize((s) => Math.max(s - 80, 280));
  const reset = () => setMapSize(560);

  // Build lookup: exact library name → StateSales
  const dataMap = useMemo(() => {
    const m: Record<string, StateSales> = {};
    stateData.forEach((s) => {
      const lib = toLibraryName(s.state);
      if (m[lib]) {
        m[lib] = {
          state: lib,
          orders: m[lib].orders + s.orders,
          revenue: m[lib].revenue + s.revenue,
        };
      } else {
        m[lib] = { ...s, state: lib };
      }
    });
    return m;
  }, [stateData]);

  const maxOrders = useMemo(
    () => Math.max(0, ...Object.values(dataMap).map((s) => s.orders)),
    [dataMap],
  );

  // cityColors keyed by exact library state names
  const cityColors = useMemo(() => {
    const colors: Record<string, string> = {};
    ALL_LIBRARY_STATES.forEach((name) => {
      const entry = dataMap[name];
      colors[name] = getColor(entry?.orders ?? 0, maxOrders);
    });
    return colors;
  }, [dataMap, maxOrders]);

  const selectedEntry = selectedState ? dataMap[selectedState] : null;
  const hoveredEntry = hoveredState ? dataMap[hoveredState] : null;

  // Track mouse over SVG paths
  const handleMouseMove = (e: React.MouseEvent) => {
    const target = e.target as SVGElement;
    if (target && target.tagName === "path" && target.id) {
      // Library sets id like "Jammu and Kashmir-12345"
      const found = ALL_LIBRARY_STATES.find((name) => target.id.startsWith(name + "-"));
      if (found) {
        setHoveredState(found);
        setMousePos({ x: e.clientX, y: e.clientY });
        return;
      }
    }
    setHoveredState(null);
  };

  const handleMouseLeave = () => setHoveredState(null);

  // Derive sorted states based on toggle
  const sortedStateData = useMemo(() => {
    return [...stateData].sort((a, b) => {
      if (sortBy === "orders") {
        if (b.orders !== a.orders) return b.orders - a.orders; // Primary: Orders
        return b.revenue - a.revenue; // Secondary: Revenue
      } else {
        if (b.revenue !== a.revenue) return b.revenue - a.revenue; // Primary: Revenue
        return b.orders - a.orders; // Secondary: Orders
      }
    });
  }, [stateData, sortBy]);

  return (
    <div className="relative w-full">
      {/* ── Map Card ── */}
      <div className="relative rounded-xl border border-green-100 shadow-md bg-gradient-to-b from-sky-50 to-blue-50 p-4">

        {/* Header row */}
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <span className="text-base">🗺️</span>
            Sales by State — India
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 shadow-sm p-0.5">
              <button
                onClick={zoomOut}
                disabled={mapSize <= 280}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <span className="text-[10px] text-gray-500 w-10 text-center font-medium">
                {Math.round((mapSize / 560) * 100)}%
              </span>
              <button
                onClick={zoomIn}
                disabled={mapSize >= 1200}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <button
                onClick={reset}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors border-l border-gray-200 ml-0.5"
                title="Reset zoom"
              >
                <RotateCcw className="w-3 h-3 text-gray-400" />
              </button>
            </div>

            {Object.keys(dataMap).length > 0 && (
              <div className="bg-white/90 rounded-full px-3 py-1 shadow border border-green-100 text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="font-bold text-green-700">{Object.keys(dataMap).length}</span>
                <span className="text-gray-500">states with orders</span>
              </div>
            )}
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm rounded-xl">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-500 font-medium">Loading orders…</p>
          </div>
        )}

        {/* Click-to-inspect panel */}
        {selectedState && (
          <div className="absolute top-16 right-6 z-10 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 min-w-[190px]">
            <p className="font-bold text-gray-900 text-sm mb-2 border-b border-gray-100 pb-2">
              {selectedState}
            </p>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">Orders</span>
              <span className="font-bold text-gray-800">{selectedEntry?.orders ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Revenue</span>
              <span className="font-bold text-green-600">
                {selectedEntry ? formatCurrency(selectedEntry.revenue) : "₹0"}
              </span>
            </div>
            {!selectedEntry && (
              <p className="mt-2 text-[10px] text-red-400 font-medium">No orders yet</p>
            )}
          </div>
        )}

        {/* India Map — centered, scrollable on zoom */}
        <div
          className="overflow-auto flex justify-center cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <India
            type="select-single"
            size={mapSize}
            hints={false}
            strokeColor="#ffffff"
            strokeWidth={0.8}
            hoverColor="#86efac"
            selectColor="#16a34a"
            cityColors={cityColors}
            onSelect={(state) => setSelectedState(state)}
          />
        </div>

        {/* Custom Hover Tooltip */}
        {hoveredState && (
          <div
            className="fixed z-50 pointer-events-none bg-white rounded-xl shadow-xl border border-gray-100 px-3 py-2 min-w-[150px] transform -translate-x-1/2 -translate-y-full"
            style={{ left: mousePos.x, top: mousePos.y - 15 }}
          >
            <p className="font-bold text-gray-900 text-xs mb-1.5 border-b border-gray-100 pb-1.5">
              {hoveredState}
            </p>
            <div className="flex items-center justify-between text-[11px] mb-0.5">
              <span className="text-gray-500">Orders</span>
              <span className="font-bold text-gray-800">{hoveredEntry?.orders ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500">Revenue</span>
              <span className="font-bold text-green-600">
                {hoveredEntry ? formatCurrency(hoveredEntry.revenue) : "₹0"}
              </span>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-3 flex items-center gap-6 flex-wrap text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-24 rounded-full"
              style={{ background: "linear-gradient(to right, #bbf7d0, #16a34a, #14532d)" }}
            />
            <span>Low → High orders</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 rounded-full bg-red-300" />
            <span className="text-red-500 font-semibold">No orders</span>
          </div>
          {maxOrders > 0 && (
            <span className="ml-auto text-gray-400">
              Max: <span className="font-bold text-green-700">{maxOrders} orders</span>
            </span>
          )}
        </div>
      </div>

      {/* ── Top-10 state ranking cards ── */}
      {stateData.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="text-sm font-semibold text-gray-700">Top 10 States</h3>

            {/* Sorting Toggle */}
            <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
              <button
                onClick={() => setSortBy("orders")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${sortBy === "orders"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                By Orders
              </button>
              <button
                onClick={() => setSortBy("revenue")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${sortBy === "revenue"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                By Revenue
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {sortedStateData.slice(0, 10).map((s, i) => (
              <div
                key={s.state}
                className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-green-100 bg-green-50/50 transition-all hover:shadow-md hover:bg-green-50"
              >
                <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black text-white mt-0.5 bg-green-600">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate text-gray-800 leading-tight">{s.state}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{s.orders} orders</p>
                  <p className="text-[10px] font-semibold text-green-700">{formatCurrency(s.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
