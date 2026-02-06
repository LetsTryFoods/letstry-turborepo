'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

function SearchBarContent({
  className,
  placeholder = 'Search for products',
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (pathname === '/search') {
      const q = searchParams.get('q') || '';
      setSearchValue(q);
    }
  }, [pathname, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (pathname === '/search') {
      const params = new URLSearchParams();
      if (value) {
        params.set('q', value);
      }
      router.replace(`/search?${params.toString()}`);
    }
  };

  const handleFocus = () => {
    if (pathname !== '/search') {
      router.push('/search');
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 hover:bg-gray-100 transition-colors focus-within:border-[#0c5273] focus-within:ring-1 focus-within:ring-[#0c5273]',
        className
      )}
    >
      <Search className="h-6 w-6 text-gray-400 flex-shrink-0" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}

export const SearchBar = (props: SearchBarProps) => {
  return (
    <Suspense fallback={
      <div
        className={cn(
          'flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 focus-within:border-[#0c5273] focus-within:ring-1 focus-within:ring-[#0c5273]',
          props.className
        )}
      >
        <Search className="h-6 w-6 text-gray-400 flex-shrink-0" />
        <Input
          type="text"
          placeholder={props.placeholder || 'Search for products'}
          disabled
          className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    }>
      <SearchBarContent {...props} />
    </Suspense>
  );
};
