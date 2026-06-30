"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_ACTIVE_BOX_SIZES } from "@/lib/boxes/queries";
import { useAssignBoxToOrder } from "@/lib/orders/queries";
import { Button } from "@/components/ui/button";
import { Loader2, PackageSearch } from "lucide-react";
import { toast } from "sonner";

export function ManualBoxAssignment({ orderId, currentBoxId }: { orderId: string, currentBoxId?: string }) {
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const { data, loading } = useQuery(GET_ACTIVE_BOX_SIZES, {
    fetchPolicy: "cache-first",
  });
  const { assignBox, loading: assigning } = useAssignBoxToOrder();

  const handleAssign = async (boxId: string) => {
    if (!boxId) return;
    setAssigningId(boxId);
    try {
      await assignBox({ orderId, boxId });
      toast.success("Box assigned successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to assign box");
    } finally {
      setAssigningId(null);
    }
  };

  const boxes = (data as any)?.getActiveBoxSizes || [];

  return (
    <div className="flex items-center gap-2">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <select
          className="h-8 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          value={currentBoxId || ""}
          onChange={(e) => handleAssign(e.target.value)}
          disabled={assigning}
        >
          <option value="" disabled>Select a box</option>
          {boxes.map((box: any) => (
            <option key={box.id} value={box.id}>
              {box.name} ({box.lengthInches}x{box.breadthInches}x{box.heightInches}")
            </option>
          ))}
        </select>
      )}
      {assigning && (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      )}
    </div>
  );
}
