"use client";

import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Sheet,
  FileText,
  Upload,
  Download,
  RefreshCw,
  Settings,
  CheckCircle,
  AlertCircle,
  Table as TableIcon,
  Trash2,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";

// Sample datasets for quick loading
const SAMPLES = {
  products: `SKU,Product Name,Category,Price,Stock,Status
LET-TRY-001,Palm Oil Free Almonds,Snacks,4.99,150,In Stock
LET-TRY-002,Organic Oat Bar,Snacks,2.49,420,In Stock
LET-TRY-003,Sugar-Free Dark Chocolate,Sweets,5.99,0,Out of Stock
LET-TRY-004,Gluten-Free Cracker Packs,Snacks,3.89,85,In Stock
LET-TRY-005,Cold Pressed Green Juice,Beverages,6.50,45,In Stock
LET-TRY-006,Roasted Hemp Seed Mix,Snacks,7.20,0,Out of Stock`,

  customers: `CustomerID;FirstName;LastName;Email;Country;Status
CUST-10492;Aarav;Sharma;aarav.sharma@example.com;India;Active
CUST-29381;Emma;Watson;emma.w@example.com;UK;Active
CUST-84920;Kaito;Tanaka;kaito.t@example.com;Japan;Inactive
CUST-38291;Sofia;Rodriguez;sofia.r@example.com;Spain;Active
CUST-58392;Liam;Smith;liam.smith@example.com;USA;Active
CUST-94821;Chloe;Dubois;chloe.d@example.com;France;Active`,

  performance: `Employee\tDepartment\tMonday\tTuesday\tWednesday\tThursday\tFriday\tTotalHours
Rajesh Kumar\tEngineering\t8.5\t9.0\t8.0\t8.5\t9.0\t43.0
Sarah Jenkins\tMarketing\t8.0\t8.0\t7.5\t8.0\t8.0\t39.5
Akira Sato\tProduct\t9.0\t9.0\t9.0\t9.0\t8.5\t44.5
Elena Rostova\tDesign\t7.5\t8.0\t8.0\t7.5\t8.0\t39.0
Carlos Gomez\tOperations\t8.0\t8.5\t8.5\t8.0\t8.0\t41.0`,
};

interface ParsedData {
  headers: string[];
  rows: string[][];
}

export default function CSVToExcelPage() {
  // Input CSV State
  const [csvInput, setCsvInput] = useState<string>("");
  const [delimiter, setDelimiter] = useState<string>(",");
  const [hasHeaders, setHasHeaders] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  // Output Config State
  const [fileName, setFileName] = useState<string>("converted_data");
  const [sheetName, setSheetName] = useState<string>("CSV Data");
  const [autoFitColumns, setAutoFitColumns] = useState<boolean>(true);
  const [colorTheme, setColorTheme] = useState<string>("emerald");

  // Parser Result State
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // RFC-4180 Compliant CSV Parser
  const parseCSVData = (text: string, delim: string): ParsedData => {
    if (!text.trim()) {
      return { headers: [], rows: [] };
    }

    const result: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          cell += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delim && !inQuotes) {
        row.push(cell);
        cell = "";
      } else if ((char === "\r" || char === "\n") && !inQuotes) {
        if (char === "\r" && nextChar === "\n") {
          i++;
        }
        row.push(cell);
        result.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }

    if (cell !== "" || row.length > 0) {
      row.push(cell);
      result.push(row);
    }

    // Filter out completely empty rows
    const cleanedRows = result.filter(
      (r) => r.length > 1 || (r.length === 1 && r[0].trim() !== ""),
    );

    if (cleanedRows.length === 0) {
      return { headers: [], rows: [] };
    }

    // Determine header row and contents
    if (hasHeaders) {
      const headers = cleanedRows[0].map(
        (h) =>
          h.trim() || `Column ${Math.random().toString(36).substring(2, 5)}`,
      );
      const rows = cleanedRows.slice(1);
      return { headers, rows };
    } else {
      const maxCols = cleanedRows.reduce(
        (max, r) => Math.max(max, r.length),
        0,
      );
      const headers = Array.from(
        { length: maxCols },
        (_, idx) => `Column ${idx + 1}`,
      );
      return { headers, rows: cleanedRows };
    }
  };

  // Parse whenever input, delimiter, or header config changes
  useEffect(() => {
    try {
      if (!csvInput.trim()) {
        setParsedData(null);
        setError(null);
        return;
      }
      const data = parseCSVData(csvInput, delimiter);
      setParsedData(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(
        "Failed to parse CSV. Please check formatting, delimiters, and quotes.",
      );
      setParsedData(null);
    }
  }, [csvInput, delimiter, hasHeaders]);

  // Detect delimiter automatically if user drags a file
  const detectDelimiter = (text: string): string => {
    const commas = (text.match(/,/g) || []).length;
    const semicolons = (text.match(/;/g) || []).length;
    const tabs = (text.match(/\t/g) || []).length;
    const pipes = (text.match(/\|/g) || []).length;

    const max = Math.max(commas, semicolons, tabs, pipes);
    if (max === 0) return ",";
    if (max === commas) return ",";
    if (max === semicolons) return ";";
    if (max === tabs) return "\t";
    return "|";
  };

  // File loading helper
  const handleFileLoad = (file: File) => {
    if (!file) return;

    const nameWithoutExt =
      file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    setFileName(nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, "_"));
    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        // Auto-detect delimiter
        const autoDelim = detectDelimiter(text.substring(0, 2000));
        setDelimiter(autoDelim);
        setCsvInput(text);
        toast.success(`Loaded "${file.name}" with autodetected delimiter`);
      }
    };
    reader.readAsText(file);
  };

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileLoad(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileLoad(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = (key: keyof typeof SAMPLES) => {
    const text = SAMPLES[key];
    if (key === "customers") {
      setDelimiter(";");
    } else if (key === "performance") {
      setDelimiter("\t");
    } else {
      setDelimiter(",");
    }
    setCsvInput(text);
    setFileName(`sample_${key}_export`);
    setSelectedFileName("");
    toast.success(`Loaded ${key} sample dataset`);
  };

  const handleClear = () => {
    setCsvInput("");
    setSelectedFileName("");
    setFileName("converted_data");
    setSheetName("CSV Data");
    setParsedData(null);
    setError(null);
    toast.success("Cleared input and configurations");
  };

  // Excel Export Handler
  const handleExport = () => {
    if (
      !parsedData ||
      (parsedData.headers.length === 0 && parsedData.rows.length === 0)
    ) {
      toast.error(
        "No data available to export. Please paste or upload a CSV first.",
      );
      return;
    }

    try {
      const cleanFileName = fileName.trim() || "converted_data";
      const cleanSheetName = sheetName.trim().substring(0, 31) || "CSV Data"; // SheetJS / Excel limit sheet to 31 chars

      // Reconstruct combined data (headers + rows)
      const combinedData = [parsedData.headers, ...parsedData.rows];

      // Create new workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(combinedData);

      // Auto-fit Columns implementation
      if (autoFitColumns) {
        const maxCols = combinedData.reduce(
          (max, row) => Math.max(max, row.length),
          0,
        );
        const colWidths = Array.from({ length: maxCols }, (_, colIndex) => {
          let maxLength = 8; // Default fallback length
          combinedData.forEach((row) => {
            const cellValue = row[colIndex];
            if (cellValue != null) {
              const strVal = String(cellValue);
              maxLength = Math.max(maxLength, strVal.length + 2);
            }
          });
          return { wch: maxLength };
        });
        ws["!cols"] = colWidths;
      }

      XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);

      // Write workbook file and trigger download
      XLSX.writeFile(wb, `${cleanFileName}.xlsx`);
      toast.success("Excel sheet generated and downloaded successfully!", {
        duration: 4000,
        icon: "🎉",
      });
    } catch (err: any) {
      console.error(err);
      toast.error(`Export failed: ${err.message || "Unknown error"}`);
    }
  };

  // Render variables for selected theme classes
  const getThemeClasses = () => {
    switch (colorTheme) {
      case "indigo":
        return {
          badge:
            "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
          button:
            "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500",
          border:
            "border-indigo-200 dark:border-indigo-800/80 focus-within:border-indigo-500",
          text: "text-indigo-600 dark:text-indigo-400",
          headerBg:
            "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200",
          glow: "shadow-[0_0_20px_-3px_rgba(99,102,241,0.15)]",
        };
      case "amber":
        return {
          badge:
            "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
          button:
            "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500",
          border:
            "border-amber-200 dark:border-amber-800/80 focus-within:border-amber-500",
          text: "text-amber-600 dark:text-amber-400",
          headerBg:
            "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200",
          glow: "shadow-[0_0_20px_-3px_rgba(245,158,11,0.15)]",
        };
      case "slate":
        return {
          badge:
            "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-850/40 dark:text-slate-300 dark:border-slate-800",
          button:
            "bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500",
          border:
            "border-slate-200 dark:border-slate-800/80 focus-within:border-slate-500",
          text: "text-slate-700 dark:text-slate-400",
          headerBg:
            "bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-200",
          glow: "shadow-[0_0_20px_-3px_rgba(100,116,139,0.15)]",
        };
      case "emerald":
      default:
        return {
          badge:
            "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
          button:
            "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500",
          border:
            "border-emerald-200 dark:border-emerald-800/80 focus-within:border-emerald-500",
          text: "text-emerald-600 dark:text-emerald-400",
          headerBg:
            "bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200",
          glow: "shadow-[0_0_20px_-3px_rgba(16,185,129,0.15)]",
        };
    }
  };

  const activeTheme = getThemeClasses();
  const charCount = csvInput.length;
  const totalLines = csvInput ? csvInput.split(/\r\n|\n/).length : 0;

  return (
    <div
      className={`p-6 max-w-7xl mx-auto space-y-6 ${activeTheme.glow} transition-all duration-300`}
    >
      {/* Header section with Premium visual identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-card border rounded-2xl relative overflow-hidden backdrop-blur-xl shadow-xs">
        <div className="absolute top-0 right-0 p-8 opacity-10 select-none pointer-events-none">
          <FileSpreadsheet className="h-40 w-40 text-muted-foreground" />
        </div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg dark:bg-emerald-500/20">
              <Sheet className="h-5 w-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Data Utilities
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-2">
            CSV to Excel Converter
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Convert custom CSV data into optimized, beautifully spaced Excel
            (.xlsx) workbooks instantly. Completely client-side execution
            ensures your business data remains highly secure.
          </p>
        </div>

        {/* Sample presets */}
        <div className="flex flex-wrap gap-2 relative z-10">
          <span className="text-xs text-muted-foreground self-center w-full md:w-auto md:text-right font-medium mb-1 md:mb-0 mr-1">
            Load Sample:
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLoadSample("products")}
            className="text-xs hover:border-emerald-500/50 hover:bg-emerald-500/5"
          >
            Product Catalog
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLoadSample("customers")}
            className="text-xs hover:border-indigo-500/50 hover:bg-indigo-500/5"
          >
            Semicolon Contacts
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLoadSample("performance")}
            className="text-xs hover:border-amber-500/50 hover:bg-amber-500/5"
          >
            Tab Delimited
          </Button>
        </div>
      </div>

      {/* Main layout grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Inputs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card border rounded-2xl p-6 space-y-4">
            {/* Input toggle header */}
            <div className="flex justify-between items-center pb-2 border-b">
              <div className="flex items-center gap-2">
                <FileText className={`h-4 w-4 ${activeTheme.text}`} />
                <span className="font-semibold text-sm">
                  Paste CSV Text or Drop File
                </span>
              </div>

              {csvInput && (
                <div className="flex gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full border bg-muted text-muted-foreground">
                    {totalLines} lines • {charCount.toLocaleString()} chars
                  </span>
                  <button
                    onClick={handleClear}
                    className="text-xs text-destructive hover:underline flex items-center gap-1 font-medium transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Clear
                  </button>
                </div>
              )}
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10"
                  : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,.txt"
                className="hidden"
              />
              <div
                className={`p-3 rounded-full bg-muted/80 text-muted-foreground group-hover:scale-110 transition-transform ${isDragging ? "text-emerald-500 bg-emerald-500/10" : ""}`}
              >
                <Upload className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">
                  {selectedFileName ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Selected: {selectedFileName}
                    </span>
                  ) : (
                    "Click to upload or drag & drop a .csv file"
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Accepts CSV or TXT, text content parsed instantly
                </p>
              </div>
            </div>

            {/* Textarea container */}
            <div className="relative">
              <textarea
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="Name,Email,Department,JoinDate&#10;Rajesh Kumar,rajesh@letstry.com,Engineering,2024-03-12&#10;Sarah Jenkins,sarah@letstry.com,Marketing,2025-01-20"
                className={`w-full h-80 px-4 py-3 rounded-xl border bg-card font-mono text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner ${activeTheme.border}`}
              />
              {!csvInput && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                  <div className="text-center opacity-25 flex flex-col items-center gap-2">
                    <TableIcon className="h-10 w-10 text-muted-foreground" />
                    <span className="text-xs">
                      Paste CSV data directly or choose a sample to start
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Parser Error Alert */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-sm leading-snug animate-pulse">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Parsing Error Detected</p>
                  <p className="text-xs opacity-90 mt-0.5">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Config & Export Dashboard (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Settings className={`h-4 w-4 ${activeTheme.text}`} />
              <span className="font-semibold text-sm">Export Settings</span>
            </div>

            {/* Delimiter Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">
                CSV Delimiter / Separator
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: ",", label: "Comma (,)" },
                  { value: ";", label: "Semicolon (;)" },
                  { value: "\t", label: "Tab" },
                  { value: "|", label: "Pipe (|)" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      setDelimiter(item.value);
                      toast.success(
                        `Delimiter changed to: "${item.value === "\t" ? "Tab" : item.value}"`,
                      );
                    }}
                    className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                      delimiter === item.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {/* Filename Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                  <span>Excel Filename</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    Auto-appends .xlsx
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) =>
                      setFileName(
                        e.target.value.replace(/[^a-zA-Z0-9_\-\s]/g, ""),
                      )
                    }
                    placeholder="converted_data"
                    className="w-full pl-3 pr-14 py-2 border rounded-lg text-sm bg-card focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="absolute right-3 top-2 text-xs font-mono text-muted-foreground select-none">
                    .xlsx
                  </span>
                </div>
              </div>

              {/* Sheetname Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                  <span>Sheet Name</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    Max 31 chars
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={31}
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="CSV Data"
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-card focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold block">
                    First Row is Header
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    Apply prominent style to first row
                  </span>
                </div>
                <Switch checked={hasHeaders} onCheckedChange={setHasHeaders} />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold block">
                    Auto-fit Columns
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    Compute cell widths to prevent overflow
                  </span>
                </div>
                <Switch
                  checked={autoFitColumns}
                  onCheckedChange={setAutoFitColumns}
                />
              </div>
            </div>

            {/* Visual Color Theme Selector (Preview UI Styling) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">
                Preview Accent Color
              </label>
              <div className="flex gap-2">
                {[
                  { value: "emerald", class: "bg-emerald-500" },
                  { value: "indigo", class: "bg-indigo-500" },
                  { value: "amber", class: "bg-amber-500" },
                  { value: "slate", class: "bg-slate-600" },
                ].map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => {
                      setColorTheme(theme.value);
                      toast.success(`Theme updated to ${theme.value}`);
                    }}
                    className={`size-6 rounded-full border-2 transition-all relative ${theme.class} ${
                      colorTheme === theme.value
                        ? "ring-2 ring-primary ring-offset-2 scale-110"
                        : "opacity-80 hover:opacity-100 border-transparent"
                    }`}
                    title={theme.value.toUpperCase()}
                  />
                ))}
              </div>
            </div>

            {/* Core Export button */}
            <Button
              onClick={handleExport}
              disabled={
                !parsedData ||
                (parsedData.headers.length === 0 &&
                  parsedData.rows.length === 0)
              }
              className={`w-full py-6 rounded-xl text-white font-semibold transition-all duration-300 shadow-md ${activeTheme.button} hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2`}
            >
              <Download className="h-5 w-5" />
              <span>Convert & Download Excel</span>
            </Button>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground justify-center">
              <CheckCircle className="h-3 w-3 text-emerald-500" />
              <span>Safe & Secure Client-Side Conversion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Spreadsheet Table Preview */}
      <div className="bg-card border rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex justify-between items-center pb-2 border-b">
          <div className="flex items-center gap-2">
            <TableIcon className={`h-4 w-4 ${activeTheme.text}`} />
            <span className="font-semibold text-sm">
              Real-Time Table Preview
            </span>
          </div>

          {parsedData && parsedData.rows.length > 0 && (
            <span
              className={`text-[11px] border font-medium px-2 py-0.5 rounded-full ${activeTheme.badge}`}
            >
              Showing first {Math.min(10, parsedData.rows.length)} of{" "}
              {parsedData.rows.length} records • {parsedData.headers.length}{" "}
              columns
            </span>
          )}
        </div>

        {parsedData && parsedData.rows.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-muted/50 max-h-96">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr
                  className={`${activeTheme.headerBg} border-b font-semibold select-none`}
                >
                  <th className="py-3 px-4 border-r w-12 text-center text-muted-foreground">
                    #
                  </th>
                  {parsedData.headers.map((hdr, idx) => (
                    <th
                      key={idx}
                      className="py-3 px-4 font-mono font-bold tracking-wide border-r last:border-r-0"
                    >
                      {hdr}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {parsedData.rows.slice(0, 10).map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b last:border-b-0 hover:bg-muted/40 transition-colors even:bg-muted/20"
                  >
                    <td className="py-2.5 px-4 border-r w-12 text-center text-muted-foreground font-mono select-none">
                      {rowIdx + 1}
                    </td>
                    {parsedData.headers.map((_, colIdx) => (
                      <td
                        key={colIdx}
                        className="py-2.5 px-4 font-mono border-r last:border-r-0 max-w-xs truncate"
                      >
                        {row[colIdx] !== undefined ? (
                          row[colIdx]
                        ) : (
                          <span className="text-muted-foreground italic opacity-50">
                            null
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center border-2 border-dashed rounded-xl border-muted/30">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-muted rounded-full">
                <HelpCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Table Preview is Empty</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Once you paste CSV data or drag & drop a file, a
                  spreadsheet-like preview will automatically populate here.
                </p>
              </div>
            </div>
          </div>
        )}

        {parsedData && parsedData.rows.length > 10 && (
          <div className="text-center text-[10px] text-muted-foreground pt-1 italic">
            * Tabular preview is capped at 10 rows for optimal performance. The
            exported Excel file will contain all {parsedData.rows.length} rows.
          </div>
        )}
      </div>
    </div>
  );
}
