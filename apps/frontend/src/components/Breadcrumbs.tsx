import Link from "next/link";

export interface BreadcrumbCrumb {
  label: string;
  href?: string;
}

/**
 * Visible breadcrumb component used on category, blog, pillar and author
 * pages. Always pair this with a matching BreadcrumbList JSON-LD on the
 * same page so the visible UI matches the schema.
 */
export function Breadcrumbs({ crumbs }: { crumbs: BreadcrumbCrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
      <ol className="flex flex-wrap items-center gap-1">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1">
              {!isLast && c.href ? (
                <Link
                  href={c.href}
                  className="hover:text-gray-800 underline-offset-2 hover:underline"
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="text-gray-800"
                >
                  {c.label}
                </span>
              )}
              {!isLast && <span className="mx-1 text-gray-400">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
