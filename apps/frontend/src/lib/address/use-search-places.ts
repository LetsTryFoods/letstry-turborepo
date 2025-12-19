"use client";

import { useState, useEffect } from 'react';
import { useGraphQLQuery } from '@/lib/graphql/use-graphql-query';
import { SEARCH_PLACES } from '@/lib/queries/address';

export const useSearchPlaces = (query: string, debounceMs: number = 500) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [query, debounceMs]);

  return useGraphQLQuery(
    ['searchPlaces', debouncedQuery],
    SEARCH_PLACES.toString(),
    { query: debouncedQuery, sessionToken: undefined },
    {
      enabled: debouncedQuery.length > 2,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );
};
