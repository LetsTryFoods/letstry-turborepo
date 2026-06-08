"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, ExternalLink } from "lucide-react";
import { SeoStatusBadge } from "@/components/seo/SeoStatusBadge";
import { Policy } from "@/lib/policies/usePolicies";

interface PolicySeoTableProps {
  policies: Policy[];
  loading: boolean;
  onManageSeo: (policy: Policy) => void;
}

export function PolicySeoTable({
  policies,
  loading,
  onManageSeo,
}: PolicySeoTableProps) {
  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading policies...
      </div>
    );
  }

  if (!policies.length) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No policies found.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Policy Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>SEO Status</TableHead>
            <TableHead>Meta Title</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((policy) => (
            <TableRow key={policy._id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{policy.title}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {policy.type}
                </Badge>
              </TableCell>
              <TableCell>
                <SeoStatusBadge
                  hasSeo={!!(policy.seo && policy.seo.metaTitle)}
                />
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-muted-foreground">
                {policy.seo?.metaTitle || "-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onManageSeo(policy)}
                    className="gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Manage
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={`/policies/${policy.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
