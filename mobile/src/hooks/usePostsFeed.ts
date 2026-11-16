import { useCallback, useRef, useState } from 'react';

import { getErrorMessage } from '../services/api';
import { postService } from '../services/postService';
import type { Post } from '../types';

interface Options {
  query: string;
  /** "public" usa GET /posts; "admin" usa GET /posts/admin (protegida) */
  source: 'public' | 'admin';
  pageSize?: number;
}

type FetchMode = 'reload' | 'refresh' | 'more';

function mergeById(current: Post[], incoming: Post[]): Post[] {
  const known = new Set(current.map((post) => post.id));
  return [...current, ...incoming.filter((post) => !known.has(post.id))];
}

/**
 * Listagem de posts com busca, "puxar para atualizar" e rolagem infinita.
 * Respostas antigas (de uma busca anterior) são descartadas pelo requestId.
 */
export function usePostsFeed({ query, source, pageSize = 10 }: Options) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestRef = useRef(0);
  const busyRef = useRef(false);

  const fetchPage = useCallback(
    async (target: number, mode: FetchMode) => {
      const requestId = ++requestRef.current;
      busyRef.current = true;
      if (mode === 'reload') setReloading(true);
      if (mode === 'refresh') setRefreshing(true);
      if (mode === 'more') setLoadingMore(true);

      try {
        const fetcher = source === 'admin' ? postService.listAdmin : postService.list;
        const result = await fetcher({ page: target, limit: pageSize, q: query || undefined });
        if (requestId !== requestRef.current) return;

        setPosts((current) => (target === 1 ? result.data : mergeById(current, result.data)));
        setPage(result.page);
        setTotalPages(result.totalPages);
        setTotal(result.total);
        setError(null);
      } catch (err) {
        if (requestId !== requestRef.current) return;
        setError(getErrorMessage(err));
      } finally {
        if (requestId === requestRef.current) {
          busyRef.current = false;
          setInitialized(true);
          setReloading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [query, source, pageSize],
  );

  const reload = useCallback(() => fetchPage(1, 'reload'), [fetchPage]);
  const refresh = useCallback(() => fetchPage(1, 'refresh'), [fetchPage]);

  const loadMore = useCallback(() => {
    if (busyRef.current || page >= totalPages) return;
    void fetchPage(page + 1, 'more');
  }, [fetchPage, page, totalPages]);

  /** Remove um post da lista local após exclusão, sem recarregar tudo. */
  const removeLocal = useCallback((id: string) => {
    setPosts((current) => current.filter((post) => post.id !== id));
    setTotal((current) => Math.max(0, current - 1));
  }, []);

  return {
    posts,
    total,
    error,
    initialized,
    reloading,
    refreshing,
    loadingMore,
    hasMore: page < totalPages,
    reload,
    refresh,
    loadMore,
    removeLocal,
  };
}
