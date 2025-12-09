import type { PaginatedResponse } from '@/types/requests';
import { api, FetchApiError } from '@/utils/fetchApi';
import { useCallback, useEffect, useState } from 'react';

interface UsePaginatedFetchOptions {
  limit?: number;
  enabled?: boolean;
}

interface UsePaginatedFetchResult<T> {
  data: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function usePaginatedFetch<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {},
  options: UsePaginatedFetchOptions = {}
): UsePaginatedFetchResult<T> {
  const { limit = 10, enabled = true } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const buildUrl = useCallback((pageNum: number) => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(pageNum));
    searchParams.set('limit', String(limit));
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.set(key, String(value));
      }
    });
    
    return `${endpoint}?${searchParams.toString()}`;
  }, [endpoint, limit, params]);

  const fetchData = useCallback(async (pageNum: number, isRefresh = false) => {
    if (!enabled) return;
    
    try {
      if (isRefresh) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const url = buildUrl(pageNum);
      const response = await api.get<T[]>(url) as PaginatedResponse<T[]>;
      
      const newData = response.data.data;
      const meta = response.data.meta;

      if (isRefresh) {
        setData(newData);
      } else {
        setData(prev => [...prev, ...newData]);
      }
      
      setHasMore(meta.currentPage < meta.lastPage);
      setPage(pageNum);
    } catch (err) {
      const message = err instanceof FetchApiError ? err.message : 'Erreur de chargement';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [enabled, buildUrl]);

  const refresh = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    await fetchData(1, true);
  }, [fetchData]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    await fetchData(page + 1, false);
  }, [hasMore, isLoadingMore, isLoading, page, fetchData]);

  // Reset et refetch quand les params changent
  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    fetchData(1, true);
  }, [JSON.stringify(params), endpoint, enabled]);

  return {
    data,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
  };
}
