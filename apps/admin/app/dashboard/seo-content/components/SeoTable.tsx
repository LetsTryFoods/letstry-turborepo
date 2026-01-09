"use client";

import { Badge } from "@/components/ui/badge";
import { SeoContent } from "@/lib/seo/useSeo";
import { GenericSeoTable } from "@/components/seo/GenericSeoTable";

interface SeoTableProps {
  seoContents: SeoContent[];
  onEdit: (seo: SeoContent) => void;
  onDelete: (seo: SeoContent) => void;
  loading: boolean;
}

export function SeoTable({
  seoContents,
  onEdit,
  onDelete,
  loading,
}: SeoTableProps) {
  const columns = [
    {
      header: "Page Name",
      render: (s: SeoContent) => <span className="font-medium">{s.pageName}</span>,
    },
    {
      header: "Slug",
      render: (s: SeoContent) => (
        <code className="px-2 py-1 bg-muted rounded text-xs">/{s.pageSlug}</code>
      ),
    },
    {
      header: "Status",
      render: (s: SeoContent) => (
        <Badge variant={s.isActive ? "default" : "secondary"}>
          {s.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  if (loading && seoContents.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Loading entries...</div>;
  }

  return (
    <GenericSeoTable
      items={seoContents}
      columns={columns}
      hasSeo={() => true}
      getSeoTitle={(s) => s.metaTitle}
      getSeoDesc={(s) => s.metaDescription}
      onEdit={onEdit}
      onDelete={onDelete}
      rowKey={(s) => s._id}
    />
  );
}
