"use client"

import { useMemo, useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/lib/axios"

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10)

const getDefaultStartDate = () => {
  const date = new Date()
  date.setDate(1)
  return formatDateInput(date)
}

export default function ContactExcelDownloadDialog() {
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState(getDefaultStartDate)
  const [endDate, setEndDate] = useState(() => formatDateInput(new Date()))
  const [isDownloading, setIsDownloading] = useState(false)

  const hasInvalidRange = useMemo(() => {
    return Boolean(startDate && endDate && startDate > endDate)
  }, [endDate, startDate])

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both dates")
      return
    }

    if (hasInvalidRange) {
      toast.error("Start date cannot be after end date")
      return
    }

    try {
      setIsDownloading(true)

      const response = await api.post(
        "/data-export/contacts/excel",
        {
          startDate: `${startDate}T00:00:00.000Z`,
          endDate: `${endDate}T23:59:59.999Z`,
        },
        { responseType: "blob" },
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.download = `contact_queries_${startDate}_to_${endDate}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Contact query Excel file downloaded")
      setOpen(false)
    } catch (error) {
      console.error("Contact query export failed:", error)
      toast.error("Failed to download contact query Excel file")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Excel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Contact Queries</DialogTitle>
          <DialogDescription>
            Select a query created-date range for the Excel file.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-export-start-date">Start date</Label>
            <Input
              id="contact-export-start-date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-export-end-date">End date</Label>
            <Input
              id="contact-export-end-date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </div>

        {hasInvalidRange && (
          <p className="text-sm text-destructive">
            Start date cannot be after end date.
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDownloading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading || hasInvalidRange}
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isDownloading ? "Downloading..." : "Download"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
