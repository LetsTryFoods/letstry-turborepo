"use client"

import Image from "next/image"
import { useState, useRef, useMemo } from "react"
import { useSampleInvoiceProducts } from "@/lib/sample-invoice/queries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Plus,
  Trash2,
  Printer,
  Package,
  User,
  Building2,
  Phone,
  MapPin,
  Loader2,
  Save,
  CheckCircle2,
  History,
  FileImage,
  Pencil,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import { useCreateSampleInvoice, useSampleInvoices, useUpdateSampleInvoice } from "@/lib/sample-invoice/queries"
import { printSampleInvoiceLabel } from "@/lib/utils/label-printer"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface InvoiceLineItem {
  skuId: string
  sku: string
  skuName: string
  uom: string
  price: number
  quantity: number
}

interface RecipientDetails {
  name: string
  company: string
  address: string
  phone: string
  notes: string
}

// ---------------------------------------------------------------------------
// Auto-generate invoice number: INV-YYYYMMDD-XXX
// ---------------------------------------------------------------------------
function generateInvoiceNumber() {
  const today = format(new Date(), "yyyyMMdd")
  const suffix = Math.floor(100 + Math.random() * 900) // 3-digit random
  return `INV-${today}-${suffix}`
}

// ---------------------------------------------------------------------------
// Print styles injected into <head> so they apply globally during print
// ---------------------------------------------------------------------------
const PRINT_STYLES = `
  @media print {
    html, body {
      height: auto !important;
      overflow: visible !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    /* Ensure containers do not limit height or hide overflow during printing */
    div, main, section {
      overflow: visible !important;
      height: auto !important;
    }
    body * { visibility: hidden !important; }
    #invoice-printable, #invoice-printable * { visibility: visible !important; }
    #invoice-printable {
      position: absolute !important;
      top: 0; left: 0;
      width: 100% !important;
      height: auto !important;
      padding: 24px !important;
      margin: 0 !important;
      background: white !important;
      border: none !important;
      box-shadow: none !important;
      overflow: visible !important;
      z-index: 9999;
    }
    .no-print { display: none !important; }
  }
`

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SampleInvoicePage() {
  const { data, loading } = useSampleInvoiceProducts()

  // Flatten products and variants for searchable records
  const records = useMemo(() => {
    const productsList = (data as any)?.products?.items ?? []
    const allVariants: any[] = []
    productsList.forEach((prod: any) => {
      if (prod.variants) {
        prod.variants.forEach((v: any) => {
          allVariants.push({
            _id: v._id,
            sku: v.sku,
            name: v.name,
            price: v.price ?? 0,
            mrp: v.mrp ?? 0,
            uom: v.weight ? `${v.weight} ${v.weightUnit ?? 'g'}` : 'Pcs',
          })
        })
      }
    })
    return allVariants
  }, [data])

  // Mutation + saved invoices list
  const [createInvoice, { loading: saving }] = useCreateSampleInvoice()
  const [updateInvoice, { loading: updating }] = useUpdateSampleInvoice()
  const { data: savedData } = useSampleInvoices()
  const savedInvoices: any[] = (savedData as any)?.sampleInvoices ?? []

  const [savedId, setSavedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Invoice meta
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber)
  const invoiceDate = format(new Date(), "dd MMM yyyy")

  // Recipient
  const [recipient, setRecipient] = useState<RecipientDetails>({
    name: "",
    company: "",
    address: "",
    phone: "",
    notes: "",
  })

  // SKU picker state
  const [skuSearch, setSkuSearch] = useState("")
  const [showPicker, setShowPicker] = useState(false)

  // Selected line items
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([])

  // Print style injected once
  const styleInjected = useRef(false)
  if (typeof document !== "undefined" && !styleInjected.current) {
    const style = document.createElement("style")
    style.innerHTML = PRINT_STYLES
    document.head.appendChild(style)
    styleInjected.current = true
  }

  // Filtered SKUs for picker (exclude already added)
  const filteredSkus = useMemo(() => {
    const addedIds = new Set(lineItems.map((l) => l.skuId))
    return records
      .filter((r) => !addedIds.has(r._id))
      .filter((r) => {
        const q = skuSearch.toLowerCase()
        return (
          r.name.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q)
        )
      })
      .slice(0, 30) // cap for performance
  }, [records, lineItems, skuSearch])

  // Add a SKU to the invoice
  const addSku = (sku: any) => {
    setLineItems((prev) => [
      ...prev,
      {
        skuId: sku._id,
        sku: sku.sku,
        skuName: sku.name,
        uom: sku.uom ?? "Pcs",
        // Defaults directly to actual selling price (price) saved in the product database!
        price: sku.price ?? 0,
        quantity: 1,
      },
    ])
    setSkuSearch("")
  }

  // Update quantity
  const updateQty = (skuId: string, qty: number) => {
    if (qty < 1) return
    setLineItems((prev) =>
      prev.map((item) => (item.skuId === skuId ? { ...item, quantity: qty } : item))
    )
  }

  // Remove line
  const removeLine = (skuId: string) => {
    setLineItems((prev) => prev.filter((item) => item.skuId !== skuId))
  }

  // Totals
  const totalPcs = lineItems.reduce((acc, l) => acc + l.quantity, 0)
  const totalValue = lineItems.reduce((acc, l) => acc + l.price * l.quantity, 0)

  // Print
  const handlePrint = () => {
    window.print()
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setSavedId(null)
    setLineItems([])
    setRecipient({
      name: "",
      company: "",
      address: "",
      phone: "",
      notes: "",
    })
    setInvoiceNumber(generateInvoiceNumber())
  }

  const handleLoadInvoice = (inv: any) => {
    setEditingId(inv._id)
    setInvoiceNumber(inv.invoiceNumber)
    setRecipient({
      name: inv.recipient?.name || "",
      company: inv.recipient?.company || "",
      address: inv.recipient?.address || "",
      phone: inv.recipient?.phone || "",
      notes: inv.recipient?.notes || "",
    })

    const mapped = inv.items.map((item: any) => {
      const match = records.find((r) => r.sku === item.sku)
      return {
        skuId: match?._id || item.sku,
        sku: item.sku,
        skuName: item.skuName,
        uom: item.uom || "Pcs",
        price: item.mrp || 0,
        quantity: item.quantity,
      }
    })
    setLineItems(mapped)
  }

  const handlePrintSavedInvoice = (inv: any) => {
    handleLoadInvoice(inv)
    setTimeout(() => {
      window.print()
    }, 150)
  }

  // Save to DB
  const handleSave = async () => {
    if (lineItems.length === 0) {
      toast.error("Add at least one item before saving.")
      return
    }
    const inputPayload = {
      invoiceNumber,
      recipient: {
        name: recipient.name || undefined,
        company: recipient.company || undefined,
        address: recipient.address || undefined,
        phone: recipient.phone || undefined,
        notes: recipient.notes || undefined,
      },
      items: lineItems.map((l) => ({
        sku: l.sku,
        skuName: l.skuName,
        uom: l.uom,
        mrp: l.price,
        quantity: l.quantity,
      })),
    }

    try {
      if (editingId) {
        await updateInvoice({
          variables: {
            id: editingId,
            input: inputPayload,
          },
        })
        toast.success(`Invoice ${invoiceNumber} updated successfully!`)
        handleCancelEdit()
      } else {
        const result = await createInvoice({
          variables: {
            input: inputPayload,
          },
        })
        const id = (result.data as any)?.createSampleInvoice?._id
        setSavedId(id ?? null)
        toast.success(`Invoice ${invoiceNumber} saved successfully!`)
      }
    } catch (err: any) {
      toast.error("Save failed: " + (err?.message ?? "Unknown error"))
    }
  }

  return (
    <div className="mx-6 mb-12 space-y-6 no-print-wrapper">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between no-print">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight font-sans text-gray-800">
              {editingId ? "Edit Dispatch Invoice" : "Dispatch Invoice"}
            </h1>
            {editingId && (
              <Badge variant="outline" className="border-indigo-500 text-indigo-700 bg-indigo-50 font-mono">
                Editing: {invoiceNumber}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Generate and record dynamic dispatch invoices using your live product variant catalog.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedId && !editingId && (
            <span className="flex items-center gap-1.5 text-sm text-green-700 font-medium animate-pulse">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Saved to Database
            </span>
          )}
          {editingId && (
            <Button
              variant="ghost"
              onClick={handleCancelEdit}
              className="gap-2 text-gray-600"
            >
              Cancel Edit
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={lineItems.length === 0 || saving || updating}
            className="gap-2"
          >
            {saving || updating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {editingId ? (updating ? "Updating..." : "Update Invoice") : (saving ? "Saving..." : "Save Invoice")}
          </Button>
          <Button
            onClick={handlePrint}
            disabled={lineItems.length === 0}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print / Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => printSampleInvoiceLabel({
              invoiceNumber,
              recipient: {
                name: recipient.name,
                company: recipient.company,
                address: recipient.address,
                phone: recipient.phone
              }
            })}
            disabled={lineItems.length === 0}
            className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            <FileImage className="h-4 w-4" />
            Download Custom Label
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ── LEFT: Inputs ── */}
        <div className="space-y-5 no-print">
          {/* Recipient card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Recipient Details
              </CardTitle>
              <CardDescription>Enter receiver or company dispatch details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Name *
                  </label>
                  <Input
                    placeholder="Recipient name"
                    value={recipient.name}
                    onChange={(e) => setRecipient((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Company
                  </label>
                  <Input
                    placeholder="Company / Organization"
                    value={recipient.company}
                    onChange={(e) => setRecipient((p) => ({ ...p, company: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Address
                </label>
                <Input
                  placeholder="Delivery address"
                  value={recipient.address}
                  onChange={(e) => setRecipient((p) => ({ ...p, address: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Phone
                  </label>
                  <Input
                    placeholder="+91 9999999999"
                    value={recipient.phone}
                    onChange={(e) => setRecipient((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Notes
                  </label>
                  <Input
                    placeholder="Optional remarks"
                    value={recipient.notes}
                    onChange={(e) => setRecipient((p) => ({ ...p, notes: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SKU Picker */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Select Products
              </CardTitle>
              <CardDescription>Search and add items directly from your live database catalog</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search product variant name or SKU..."
                  value={skuSearch}
                  onChange={(e) => {
                    setSkuSearch(e.target.value)
                    setShowPicker(true)
                  }}
                  onFocus={() => setShowPicker(true)}
                />
              </div>

              {/* Picker dropdown */}
              {showPicker && (
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  {loading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredSkus.length === 0 ? (
                    <p className="text-center py-6 text-sm text-muted-foreground">
                      {skuSearch ? "No matching products found" : "All items already added"}
                    </p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto divide-y">
                      {filteredSkus.map((sku) => (
                        <button
                          key={sku._id}
                          onClick={() => {
                            addSku(sku)
                            setShowPicker(false)
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-muted/60 transition-colors flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="text-sm font-medium">{sku.name}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[10px] font-mono px-1 py-0">
                                {sku.sku}
                              </Badge>
                              {sku.uom && (
                                <span className="text-xs text-muted-foreground">{sku.uom}</span>
                              )}
                              {sku.price != null && (
                                <span className="text-xs text-muted-foreground font-semibold text-green-700">
                                  Price: ₹{sku.price} (MRP: ₹{sku.mrp})
                                </span>
                              )}
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="border-t px-4 py-2 bg-muted/30">
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPicker(false)}
                    >
                      Close picker
                    </button>
                  </div>
                </div>
              )}

              {/* Added items table */}
              {lineItems.length > 0 && (
                <div className="rounded-md border overflow-hidden mt-3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Variant</TableHead>
                        <TableHead className="w-20">UoM</TableHead>
                        <TableHead className="w-28">Price (₹)</TableHead>
                        <TableHead className="w-24">Qty</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lineItems.map((item) => (
                        <TableRow key={item.skuId}>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{item.skuName}</p>
                              <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{item.uom}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              className="w-24 h-8 text-sm"
                              value={item.price}
                              onChange={(e) => setLineItems((prev) =>
                                prev.map((li) => li.skuId === item.skuId
                                  ? { ...li, price: parseFloat(e.target.value) || 0 }
                                  : li
                                )
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              className="w-20 h-8 text-sm"
                              value={item.quantity}
                              onChange={(e) => updateQty(item.skuId, parseInt(e.target.value) || 1)}
                            />
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => removeLine(item.skuId)}
                              className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT: Invoice Preview ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 no-print">
            Live Preview
          </p>
          <div
            id="invoice-printable"
            className="bg-white border rounded-xl shadow-sm p-8 font-sans text-sm"
          >
            {/* Invoice header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <Image
                  src="/logo.webp"
                  alt="LetsTry Foods"
                  width={140}
                  height={48}
                  className="object-contain"
                  priority
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dispatch Invoice
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Invoice No.</p>
                <p className="font-bold font-mono text-[#0C5273]">{invoiceNumber}</p>
                <p className="text-xs text-gray-500 mt-1">{invoiceDate}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed mb-6" />

            {/* Delivery to */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Delivered To
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                {recipient.name ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-semibold text-gray-800">{recipient.name}</span>
                    </div>
                    {recipient.company && (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-600">{recipient.company}</span>
                      </div>
                    )}
                    {recipient.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-600">{recipient.address}</span>
                      </div>
                    )}
                    {recipient.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-600">{recipient.phone}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400 italic text-xs">
                    Fill in recipient details on the left →
                  </p>
                )}
              </div>
            </div>

            {/* Line items table */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Items Dispatched
              </p>
              {lineItems.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg py-8 text-center text-gray-400 text-xs">
                  No items added yet. Search and select products from the left panel.
                </div>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#0C5273] text-white">
                      <th className="text-left px-3 py-2 rounded-tl-lg text-xs font-semibold">#</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold">SKU Name</th>
                      <th className="text-center px-3 py-2 text-xs font-semibold">UoM</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold">Price</th>
                      <th className="text-right px-3 py-2 rounded-tr-lg text-xs font-semibold">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => (
                      <tr
                        key={item.skuId}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-3 py-2 text-gray-400 text-xs whitespace-nowrap">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-gray-800 max-w-[220px]" style={{ wordBreak: 'break-word' }}>{item.skuName}</td>
                        <td className="px-3 py-2 text-center text-gray-600 whitespace-nowrap">{item.uom}</td>
                        <td className="px-3 py-2 text-right text-gray-600 whitespace-nowrap">
                          {item.price > 0 ? `₹${item.price}` : "—"}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-800 whitespace-nowrap">
                          {item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Summary */}
            {lineItems.length > 0 && (
              <div className="border-t pt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Items</span>
                  <span className="font-medium">{lineItems.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Pieces</span>
                  <span className="font-semibold">{totalPcs} pcs</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Value</span>
                  <span className="font-medium text-gray-700">₹{totalValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                  <span className="text-gray-800">Total Amount</span>
                  <span className="text-[#0C5273] font-bold">Complimentary</span>
                </div>
              </div>
            )}

            {recipient.notes && (
              <div className="mt-5 border-t pt-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                  Notes
                </p>
                <p className="text-sm text-gray-600">{recipient.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 border-t pt-4 text-center">
              <p className="text-xs text-gray-400">
                This document is for record-keeping purposes only.
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                LetsTry Foods Pvt. Ltd. — Generated on {invoiceDate}
              </p>
            </div>
          </div>

          {/* Print button below preview (mobile UX) */}
          {lineItems.length > 0 && (
            <Button
              onClick={handlePrint}
              className="w-full mt-4 gap-2 no-print"
            >
              <Printer className="h-4 w-4" />
              Print / Download PDF
            </Button>
          )}
        </div>
      </div>

      {/* ── Saved Invoices History ── */}
      <Card className="no-print">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            Saved Invoices
          </CardTitle>
          <CardDescription>All sample invoices saved to the database</CardDescription>
        </CardHeader>
        <CardContent>
          {savedInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No invoices saved yet. Create and save an invoice above.
            </p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No.</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-center">Total Pcs</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedInvoices.map((inv: any) => (
                    <TableRow key={inv._id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {inv.invoiceNumber}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {inv.recipient?.name || <span className="text-muted-foreground italic">—</span>}
                        {inv.recipient?.company && (
                          <span className="text-muted-foreground text-xs block">{inv.recipient.company}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">{inv.items.length}</TableCell>
                      <TableCell className="text-center text-sm font-medium">{inv.totalPcs}</TableCell>
                      <TableCell className="text-right text-sm font-medium">₹{inv.totalMrpValue.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {format(new Date(inv.createdAt), "dd MMM yyyy, hh:mm a")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                            onClick={() => {
                              handleLoadInvoice(inv)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            title="Edit Invoice"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8"
                            onClick={() => handlePrintSavedInvoice(inv)}
                            title="Print / Download PDF"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8 w-8"
                            onClick={() => printSampleInvoiceLabel(inv)}
                            title="Download Custom Label"
                          >
                            <FileImage className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
