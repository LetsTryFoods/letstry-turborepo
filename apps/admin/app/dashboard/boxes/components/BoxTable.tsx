import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Edit2 } from "lucide-react";
import { getCdnUrl } from "@/lib/utils/image-utils";

interface BoxTableProps {
  boxes: any[];
  loading: boolean;
  onEdit: (box: any) => void;
}

export function BoxTable({ boxes, loading, onEdit }: BoxTableProps) {
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (boxes.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">No boxes found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Photo</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Dimensions / Weight</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {boxes.map((box) => (
            <TableRow key={box._id}>
              <TableCell>
                {box.photos && box.photos.length > 0 ? (
                  <img
                    src={getCdnUrl(box.photos[0])}
                    alt={box.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-400">
                    N/A
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{box.code}</TableCell>
              <TableCell>{box.name}</TableCell>
              <TableCell>
                <Badge variant={box.type === "PACKET" ? "secondary" : "outline"}>
                  {box.type || "BOX"}
                </Badge>
              </TableCell>
              <TableCell>
                {box.type === "PACKET" ? (
                  <span className="text-muted-foreground">
                    Fixed Wt: {box.chargeableWeight ? `${box.chargeableWeight} kg` : 'N/A'}
                  </span>
                ) : (
                  <div className="flex flex-col text-sm">
                    <span>{box.lengthCm}x{box.breadthCm}x{box.heightCm} cm</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={box.isActive ? "default" : "secondary"}>
                  {box.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(box)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
