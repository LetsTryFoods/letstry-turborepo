"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileSpreadsheet,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  UploadCloud,
  Database,
  RefreshCw,
  Search,
  List,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "../components/pagination";
import { useSkuMasters, SkuMasterRecord } from "@/lib/sku-master/queries";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { toast } from "react-hot-toast";
import { GET_SKU_MASTERS } from "@/lib/sku-master/queries";
import {
  ColumnSelector,
  ColumnDefinition,
} from "../components/column-selector";

// ---------------------------------------------------------------------------
// Column Definitions for toggling
// ---------------------------------------------------------------------------
const ALL_COLUMNS: ColumnDefinition[] = [
  { key: "masterSku", label: "Master SKU" },
  { key: "skuName", label: "SKU Name" },
  { key: "vendorName", label: "Vendor" },
  { key: "vendorContactDetails", label: "Contact" },
  { key: "jobStructure", label: "Job Structure" },
  { key: "uom", label: "UoM" },
  { key: "caseSize", label: "Case Size" },
  { key: "mrp", label: "MRP" },
  { key: "npiLinksRaw", label: "NPI RAW" },
  { key: "npiLinksUpdated", label: "NPI Updated" },
  { key: "printFilesRaw", label: "Print RAW" },
  { key: "printFilesUpdated", label: "Print Updated" },
];

// ---------------------------------------------------------------------------
// GraphQL mutation — bulk upsert rows parsed from the Excel file
// ---------------------------------------------------------------------------
const BULK_UPSERT_SKU_MASTERS = gql`
  mutation BulkUpsertSkuMasters($rows: [SkuMasterRowInput!]!) {
    bulkUpsertSkuMasters(rows: $rows)
  }
`;

// ---------------------------------------------------------------------------
// Excel column → field mapping
// ---------------------------------------------------------------------------
const COLUMN_MAP: Record<string, keyof SkuMasterRecord> = {
  "Master SKU": "masterSku",
  "SKU Name": "skuName",
  "Vendors Name": "vendorName",
  "Vendors Contact Details": "vendorContactDetails",
  "Job Structure": "jobStructure",
  UoM: "uom",
  "Case Size": "caseSize",
  MRP: "mrp",
  "NPI Links RAW": "npiLinksRaw",
  "New Updated Links (to be considered)": "npiLinksUpdated",
  "Print Files RAW": "printFilesRaw",
  "New Drive Links  (to be considered)": "printFilesUpdated",
};

interface ParsedRow {
  masterSku: number;
  skuName: string;
  vendorName?: string;
  vendorContactDetails?: string;
  jobStructure?: string;
  uom?: string;
  caseSize?: number;
  mrp?: number;
  npiLinksRaw?: string;
  npiLinksUpdated?: string;
  printFilesRaw?: string;
  printFilesUpdated?: string;
}

// ---------------------------------------------------------------------------
// Helper to open a Google Drive link safely
// ---------------------------------------------------------------------------
function DriveLink({ url }: { url?: string }) {
  if (!url || url === "-")
    return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[140px]"
    >
      Drive
      <ExternalLink className="h-3 w-3 shrink-0" />
    </a>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SkuMasterPage() {
  const { data, loading, error, refetch } = useSkuMasters();
  const [bulkUpsert, { loading: uploading }] = useMutation<{
    bulkUpsertSkuMasters: number;
  }>(BULK_UPSERT_SKU_MASTERS, {
    refetchQueries: [{ query: GET_SKU_MASTERS }],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    ALL_COLUMNS.map((c) => c.key),
  );

  const toggleColumn = useCallback((key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key],
    );
  }, []);

  const records: SkuMasterRecord[] = data?.skuMasters ?? [];

  const filteredRecords = records.filter(
    (r) =>
      r.skuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(r.masterSku).includes(searchQuery) ||
      (r.vendorName || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Reset to page 1 if search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalCount = filteredRecords.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // ── Parse XLSX ─────────────────────────────────────────────────────────────
  const parseFile = useCallback((file: File) => {
    setParseError(null);
    setPreviewRows([]);
    setUploadResult(null);

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setParseError("Please upload an Excel file (.xlsx / .xls) or CSV.");
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
        });

        // Find the header row (look in the first 20 rows)
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(20, rawData.length); i++) {
          // Replace ALL whitespace (including newlines from Alt+Enter) with a single space
          const rowStr = rawData[i]
            .map((cell) => String(cell).replace(/\s+/g, " ").trim())
            .join(" ")
            .toLowerCase();

          if (rowStr.includes("master sku") || rowStr.includes("sku name")) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          const preview =
            rawData
              .slice(0, 3)
              .map((r) => r.filter(Boolean).join(" | "))
              .join(" \\n ") || "No data parsed";
          setParseError(
            `Parse Error: Sheets [${workbook.SheetNames.join(", ")}], Rows parsed: ${rawData.length}. ` +
              `Could not find 'Master SKU' or 'SKU Name' in the first 20 rows. (Preview of first 3 rows: ${preview})`,
          );
          return;
        }

        // Normalize the headers found in the file
        const fileHeaders = rawData[headerRowIndex].map((h: any) =>
          String(h).trim().replace(/\s+/g, " ").toLowerCase(),
        );

        const dataRows = rawData.slice(headerRowIndex + 1);

        const parsed: ParsedRow[] = dataRows
          .map((rowArray) => {
            const obj: Partial<ParsedRow> = {};

            for (const [excelCol, field] of Object.entries(COLUMN_MAP)) {
              // Normalize the expected column name
              const expectedCol = excelCol
                .trim()
                .replace(/\s+/g, " ")
                .toLowerCase();
              const colIndex = fileHeaders.findIndex((h) => h === expectedCol);

              if (colIndex !== -1) {
                const val = rowArray[colIndex];
                if (val === undefined || val === null || val === "") continue;

                if (field === "masterSku" || field === "caseSize") {
                  const num = Number(val);
                  if (!isNaN(num))
                    (obj as Record<string, unknown>)[field] = num;
                } else if (field === "mrp") {
                  const num = parseFloat(String(val).replace(/[^0-9.]/g, ""));
                  if (!isNaN(num)) obj.mrp = num;
                } else {
                  (obj as Record<string, unknown>)[field] = String(val).trim();
                }
              }
            }
            return obj as ParsedRow;
          })
          .filter((r) => r.masterSku && r.skuName); // Both must exist

        if (!parsed.length) {
          setParseError(
            "No valid rows found. We found headers: " +
              fileHeaders.filter(Boolean).join(", ") +
              " but no rows with both Master SKU and SKU Name.",
          );
          return;
        }

        setPreviewRows(parsed);
      } catch (err) {
        setParseError(
          "Failed to parse file: " +
            (err instanceof Error ? err.message : String(err)),
        );
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  // ── Upload to DB ────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!previewRows.length) return;
    try {
      const { data } = await bulkUpsert({ variables: { rows: previewRows } });
      const count: number = data?.bulkUpsertSkuMasters ?? previewRows.length;
      setUploadResult(count);
      setPreviewRows([]);
      setFileName(null);
      toast.success(`${count} SKU record(s) saved to database.`);
    } catch (err) {
      toast.error(
        "Upload failed: " + (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 mx-6 mb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SKU Master</h1>
          <p className="text-muted-foreground mt-1">
            Upload your Excel sheet to sync SKU data into the database.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
            <p className="text-xs text-muted-foreground">Records in database</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import from Excel
          </CardTitle>
          <CardDescription>
            Upload an <strong>.xlsx</strong>, <strong>.xls</strong>, or{" "}
            <strong>.csv</strong> file with the standard SKU Master column
            headers. Rows are matched on{" "}
            <code className="bg-muted px-1 rounded text-xs">Master SKU</code> —
            existing records are updated, new ones are inserted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/40"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <UploadCloud className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium">
              {fileName ? (
                <span className="text-primary">{fileName}</span>
              ) : (
                "Drop your Excel file here, or click to browse"
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              .xlsx · .xls · .csv
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Parse error */}
          {parseError && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {parseError}
            </div>
          )}

          {/* Success feedback */}
          {uploadResult !== null && (
            <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 rounded-lg px-4 py-3 border border-green-200">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {uploadResult} SKU record(s) successfully saved to the database.
            </div>
          )}

          {/* Preview table */}
          {previewRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Preview — {previewRows.length} row(s) detected
                </p>
                <Button onClick={handleUpload} disabled={uploading} size="sm">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploading ? "Uploading…" : "Upload to Database"}
                </Button>
              </div>

              <div className="rounded-md border overflow-x-auto max-h-72 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">SKU #</TableHead>
                      <TableHead>SKU Name</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>UoM</TableHead>
                      <TableHead className="w-16">Case</TableHead>
                      <TableHead className="w-16">MRP</TableHead>
                      <TableHead>NPI (RAW)</TableHead>
                      <TableHead>NPI (Updated)</TableHead>
                      <TableHead>Print (RAW)</TableHead>
                      <TableHead>Print (Updated)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono">
                          {row.masterSku}
                        </TableCell>
                        <TableCell
                          className="max-w-[180px] truncate"
                          title={row.skuName}
                        >
                          {row.skuName}
                        </TableCell>
                        <TableCell className="text-xs">
                          {row.vendorName ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {row.uom ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {row.caseSize ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {row.mrp != null ? `₹${row.mrp}` : "—"}
                        </TableCell>
                        <TableCell>
                          <DriveLink url={row.npiLinksRaw} />
                        </TableCell>
                        <TableCell>
                          <DriveLink url={row.npiLinksUpdated} />
                        </TableCell>
                        <TableCell>
                          <DriveLink url={row.printFilesRaw} />
                        </TableCell>
                        <TableCell>
                          <DriveLink url={row.printFilesUpdated} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing records */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              All SKU Records
            </CardTitle>
            <CardDescription>
              Current data stored in the database.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by SKU Name, Master ID, or Vendor..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <List className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="25">25 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="100">100 rows</SelectItem>
                <SelectItem value="500">500 rows</SelectItem>
              </SelectContent>
            </Select>
            <ColumnSelector
              allColumns={ALL_COLUMNS}
              selectedColumns={selectedColumns}
              onColumnToggle={toggleColumn}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive text-sm">
              Failed to load records: {error.message}
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No SKU records in the database yet. Upload an Excel file above to
              get started.
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectedColumns.includes("masterSku") && (
                      <TableHead className="w-[100px]">Master SKU</TableHead>
                    )}
                    {selectedColumns.includes("skuName") && (
                      <TableHead>SKU Name</TableHead>
                    )}
                    {selectedColumns.includes("vendorName") && (
                      <TableHead>Vendor</TableHead>
                    )}
                    {selectedColumns.includes("vendorContactDetails") && (
                      <TableHead>Contact</TableHead>
                    )}
                    {selectedColumns.includes("jobStructure") && (
                      <TableHead>Job Structure</TableHead>
                    )}
                    {selectedColumns.includes("uom") && (
                      <TableHead>UoM</TableHead>
                    )}
                    {selectedColumns.includes("caseSize") && (
                      <TableHead>Case Size</TableHead>
                    )}
                    {selectedColumns.includes("mrp") && (
                      <TableHead>MRP</TableHead>
                    )}
                    {selectedColumns.includes("npiLinksRaw") && (
                      <TableHead>NPI RAW</TableHead>
                    )}
                    {selectedColumns.includes("npiLinksUpdated") && (
                      <TableHead>NPI Updated</TableHead>
                    )}
                    {selectedColumns.includes("printFilesRaw") && (
                      <TableHead>Print RAW</TableHead>
                    )}
                    {selectedColumns.includes("printFilesUpdated") && (
                      <TableHead>Print Updated</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={12}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No matching records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRecords.map((r) => (
                      <TableRow key={r._id}>
                        {selectedColumns.includes("masterSku") && (
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="font-mono text-xs"
                            >
                              {r.masterSku}
                            </Badge>
                          </TableCell>
                        )}
                        {selectedColumns.includes("skuName") && (
                          <TableCell
                            className="font-medium max-w-[200px] truncate"
                            title={r.skuName}
                          >
                            {r.skuName}
                          </TableCell>
                        )}
                        {selectedColumns.includes("vendorName") && (
                          <TableCell className="text-sm">
                            {r.vendorName ?? "—"}
                          </TableCell>
                        )}
                        {selectedColumns.includes("vendorContactDetails") && (
                          <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate">
                            {r.vendorContactDetails ?? "—"}
                          </TableCell>
                        )}
                        {selectedColumns.includes("jobStructure") && (
                          <TableCell className="text-xs">
                            {r.jobStructure ?? "—"}
                          </TableCell>
                        )}
                        {selectedColumns.includes("uom") && (
                          <TableCell className="text-xs">
                            {r.uom ?? "—"}
                          </TableCell>
                        )}
                        {selectedColumns.includes("caseSize") && (
                          <TableCell className="text-xs">
                            {r.caseSize ?? "—"}
                          </TableCell>
                        )}
                        {selectedColumns.includes("mrp") && (
                          <TableCell className="text-xs">
                            {r.mrp != null ? `₹${r.mrp}` : "—"}
                          </TableCell>
                        )}
                        {selectedColumns.includes("npiLinksRaw") && (
                          <TableCell>
                            <DriveLink url={r.npiLinksRaw} />
                          </TableCell>
                        )}
                        {selectedColumns.includes("npiLinksUpdated") && (
                          <TableCell>
                            <DriveLink url={r.npiLinksUpdated} />
                          </TableCell>
                        )}
                        {selectedColumns.includes("printFilesRaw") && (
                          <TableCell>
                            <DriveLink url={r.printFilesRaw} />
                          </TableCell>
                        )}
                        {selectedColumns.includes("printFilesUpdated") && (
                          <TableCell>
                            <DriveLink url={r.printFilesUpdated} />
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {!loading && !error && paginatedRecords.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                hasNextPage={currentPage < totalPages}
                hasPreviousPage={currentPage > 1}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
