import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ProductBreadcrumbProps {
  items: BreadcrumbItem[];
}

export const ProductBreadcrumb: React.FC<ProductBreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mb-4 overflow-x-auto whitespace-nowrap pb-2">
      <Link href="/" className="hover:text-brand-hover transition-colors">
        Home
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          {item.href ? (
            <Link href={item.href} className="hover:text-brand-hover transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};
