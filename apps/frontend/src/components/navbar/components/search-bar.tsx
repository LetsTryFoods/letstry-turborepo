"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/stores/search-store";
import { plog } from "@/lib/debug-logger";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

function SearchBarContent({
  className,
  placeholder = "Search for products",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { searchTerm, setSearchTerm } = useSearchStore();

  plog(
    "[SearchBar] RENDER - searchTerm:",
    JSON.stringify(searchTerm),
    "| pathname:",
    pathname,
    "| searchParams q:",
    searchParams.get("q"),
  );

  // When back/forward navigation changes the URL ?q=, sync it into the store.
  // Guard: only update if the URL value differs from the current store value
  // to avoid clobbering what the user is actively typing.
  useEffect(() => {
    if (pathname === "/search") {
      const q = searchParams.get("q") || "";
      plog(
        "[SearchBar] EFFECT - URL searchParams changed. q:",
        JSON.stringify(q),
        "| store searchTerm:",
        JSON.stringify(searchTerm),
      );
      if (q !== searchTerm) {
        plog("[SearchBar] EFFECT - values differ → syncing q into store.");
        setSearchTerm(q);
      } else {
        plog("[SearchBar] EFFECT - values match → no-op.");
      }
    }
  }, [pathname, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    plog(
      "[SearchBar] INPUT CHANGE - new value:",
      JSON.stringify(e.target.value),
    );
    setSearchTerm(e.target.value);
  };

  const handleFocus = () => {
    plog("[SearchBar] INPUT FOCUS - pathname:", pathname);
    if (pathname !== "/search") {
      plog("[SearchBar] INPUT FOCUS - navigating to /search");
      // Carry current term in URL so SearchContent initialises correctly
      const q = searchTerm.trim();
      router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 hover:bg-gray-100 transition-colors focus-within:border-[#0c5273] focus-within:ring-1 focus-within:ring-[#0c5273]",
        className,
      )}
    >
      <Search className="h-6 w-6 text-gray-400 flex-shrink-0" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleFocus}
        className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}

export const SearchBar = (props: SearchBarProps) => {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            "flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 focus-within:border-[#0c5273] focus-within:ring-1 focus-within:ring-[#0c5273]",
            props.className,
          )}
        >
          <Search className="h-6 w-6 text-gray-400 flex-shrink-0" />
          <Input
            type="text"
            placeholder={props.placeholder || "Search for products"}
            disabled
            className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      }
    >
      <SearchBarContent {...props} />
    </Suspense>
  );
};
