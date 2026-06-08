"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LegacyOrder } from "@/lib/logistics/types";
import { Upload } from "lucide-react";

interface JsonImporterProps {
  onImport: (orders: LegacyOrder[]) => void;
}

export function JsonImporter({ onImport }: JsonImporterProps) {
  const [jsonText, setJsonText] = useState("");

  const handleImport = () => {
    try {
      if (!jsonText.trim()) {
        toast.error("Please paste some JSON data first");
        return;
      }

      const parsed = JSON.parse(jsonText);
      const orders = Array.isArray(parsed) ? parsed : [parsed];

      // Basic validation
      if (orders.length === 0 || !orders[0].orderId) {
        throw new Error(
          "Invalid order format. Each order must have an orderId.",
        );
      }

      onImport(orders);
      toast.success(`Successfully imported ${orders.length} orders`);
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Paste JSON here or upload a file
          </label>
          <Textarea
            placeholder='[{"orderId": "ORD...", ...}]'
            className="h-40 font-mono text-xs"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".json"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            size="sm"
            asChild={false}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setJsonText("")}>
            Clear
          </Button>
        </div>
        <Button onClick={handleImport}>Import Orders</Button>
      </div>
    </div>
  );
}
